# Multi Filter Dashboard

### API Overview
- **Resource Name:** `Multi_filter_Dashbord`
- **Sub Resource Name:** `ti_filter_Dashbord`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Multi_filter_Dashbord`
- **Lambda Function:** ``

---


### Lambda Function
```python
import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
from functools import reduce

def lambda_handler(event, context):
    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    
    # Define table name
    table_name = 'Avana'
    
    # Get the DynamoDB table object
    table = dynamodb.Table(table_name)
    
    # Define filter expressions based on provided event parameters
    filter_expressions = []
    
    # Add conditions for filtering
    if 'category' in event:
        filter_expressions.append(Key('category').eq(event['category']))
    if 'start_date' in event and 'end_date' in event:
        filter_expressions.append(Attr('dates').between(event['start_date'], event['end_date']))
    if 'doctorsname' in event:
        filter_expressions.append(Attr('doctorsname').eq(event['doctorsname']))
    if 'distributor_name' in event:
        filter_expressions.append(Attr('distributor_name').eq(event['distributor_name']))
    if 'tracking_status' in event:
        filter_expressions.append(Attr('tracking_status').eq(event['tracking_status']))
    if 'product_group' in event:
        filter_expressions.append(Attr('product_group').eq(event['product_group']))
    
    # Check if group_title is provided in the event and if it's not empty
    if 'group_title' in event and event['group_title']:
        filter_expressions.append(Attr('group_title').eq(event['group_title']))
    else:
        # If group_title is empty, add condition to check if it exists
        filter_expressions.append(Attr('group_title').exists())
    
    # Initialize an empty list to store all items
    all_items = []
    
    # Initialize overall counts and revenue
    overall_sale_count = 0
    overall_lead_count = 0
    overall_total_count = 0
    overall_total_revenue = 0
    
    # Pagination loop
    last_evaluated_key = None
    while True:
        # Query records from DynamoDB with filtering
        query_params = {
            'KeyConditionExpression': filter_expressions[0]
        }
        if len(filter_expressions) > 1:
            query_params['FilterExpression'] = reduce(lambda x, y: x & y, filter_expressions[1:])
        if last_evaluated_key:
            query_params['ExclusiveStartKey'] = last_evaluated_key
        response = table.query(**query_params)
        
        # Append items from the current response to the list
        all_items.extend(response['Items'])
        
        # Update overall counts and revenue
        for item in response['Items']:
            tracking_status = item.get('tracking_status')
            quantity_str = item.get('quantity', '0')
            unit_price_str = item.get('unit_price', '0')
            
            # Convert quantity and unit price to integers/floats
            try:
                quantity = int(quantity_str)
            except ValueError:
                quantity = 0
            
            try:
                unit_price = float(unit_price_str)
            except ValueError:
                unit_price = 0.0
            
            # Calculate revenue for the item
            revenue = quantity * unit_price
            
            # Update overall counts based on tracking_status
            if tracking_status == 'Sale':
                overall_sale_count += quantity
                overall_lead_count += quantity  # Include sales in lead count as well
            elif tracking_status == 'Lead':
                overall_lead_count += quantity
            
            # Update overall_total_count and overall_total_revenue
            overall_total_count += quantity
            overall_total_revenue += revenue
        
        # Update last evaluated key for pagination
        last_evaluated_key = response.get('LastEvaluatedKey')
        
        # Break the loop if there are no more items
        if not last_evaluated_key:
            break
    
    # Initialize an empty list for response data
    response_data = []
    
    # Iterate through items to format response data
    for item in all_items:
        distributor_name = item.get('distributor_name')
        doctors_name = item.get('doctorsname')
        tracking_status = item.get('tracking_status')
        quantity_str = item.get('quantity', '0')
        unit_price_str = item.get('unit_price', '0')
        
        # Convert quantity and unit price to integers/floats
        try:
            quantity = int(quantity_str)
        except ValueError:
            quantity = 0
        
        try:
            unit_price = float(unit_price_str)
        except ValueError:
            unit_price = 0.0
        
        # Calculate revenue for the item
        revenue = quantity * unit_price
        
        # Append item details to response data
        response_data.append({
            'distributor_name': distributor_name,
            'doctors_name': doctors_name,
            'Sale_Count': quantity if tracking_status == 'Sale' else 0,
            'Lead_Count': quantity if tracking_status == 'Lead' else 0,
            'Total_Count': quantity,
            'Total_revenue': revenue,
            'doctor_details': [{
                'unit_price': unit_price_str,
                'patientnumber': item.get('patientnumber', ''),
                'quantity': item.get('quantity', ''),
                'itemname': item.get('itemname', ''),
                'product_name': item.get('product_name', ''),
                'dates': item.get('dates', ''),
                'timestamp': item.get('timestamp', ''),
                'sales_order_status': item.get('sales_order_status', ''),
                'product_code': item.get('product_code', ''),
                'UserId': item.get('UserId', ''),
                'nickname': item.get('nickname', ''),
                'tracking_status': item.get('tracking_status', ''),
                'category': item.get('category', ''),
                'username': item.get('username', ''),
                'vendor_name': item.get('vendor_name', ''),
                'doctorsname': item.get('doctorsname', ''),
                'patientname': item.get('patientname', ''),
                'revenue': revenue
            }]
        })

    # Construct the final response
    result = {
        'overall_sale_count': overall_sale_count,
        'overall_lead_count': overall_lead_count,
        'overall_total_count': overall_total_count,
        'overall_total_revenue': overall_total_revenue,
        'overall_total_records': len(all_items),
        'response_data': response_data
    }
    
    return {
        'statusCode': 200,
        'body': json.dumps(result)
    }


```


---

## IAM Policy for the Lambda Function

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem"
            ],
            "Resource": "arn:aws:dynamodb:us-west-2:<account-id>:table/Avana"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:ListUsersInGroup",
                "cognito-idp:ListGroups"
            ],
            "Resource": "arn:aws:cognito-idp:us-west-2:<account-id>:userpool/us-west-2_rpX7WI1w2"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-west-2:<account-id>:log-group:/aws/lambda/*"
        }
    ]
}


```
---

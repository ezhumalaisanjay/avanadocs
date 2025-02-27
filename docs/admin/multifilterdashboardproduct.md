# Multi Filter Dashboard Product

### API Overview
- **Resource Name:** `Multi_filter_Dashbord_product`
- **Sub Resource Name:** ``
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Multi_filter_Dashbord_product`
- **Lambda Function:** `Multi_filter_Dashbord_product`

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
        
        # Update last evaluated key for pagination
        last_evaluated_key = response.get('LastEvaluatedKey')
        
        # Break the loop if there are no more items
        if not last_evaluated_key:
            break
    
    # Initialize dictionary to store aggregated data by product_group
    product_group_data = {}
    
    # Iterate through items to aggregate data
    for item in all_items:
        product_group = item.get('product_group', 'Unknown')
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
        
        # Initialize the product group data if not already present
        if product_group not in product_group_data:
            product_group_data[product_group] = {
                'Sale_Count': 0,
                'Lead_Count': 0,
                'Total_Count': 0,
                'Total_revenue': 0,
                'Matching_Records': []
            }
        
        # Update product group data
        if tracking_status == 'Sale':
            product_group_data[product_group]['Sale_Count'] += quantity
            product_group_data[product_group]['Lead_Count'] += quantity  # Include sales in lead count as well
            overall_sale_count += quantity
            overall_lead_count += quantity  # Include sales in lead count as well
        elif tracking_status == 'Lead':
            product_group_data[product_group]['Lead_Count'] += quantity
            overall_lead_count += quantity
        
        product_group_data[product_group]['Total_Count'] += quantity
        product_group_data[product_group]['Total_revenue'] += revenue
        
        # Update overall totals
        overall_total_count += quantity
        overall_total_revenue += revenue
        
        # Append the item to matching records
        product_group_data[product_group]['Matching_Records'].append({
            'patientnumber': item.get('patientnumber', ''),
            'quantity': item.get('quantity', ''),
            'assigner': item.get('assigner', ''),
            'product_name': item.get('product_name', ''),
            'dates': item.get('dates', ''),
            'distributor_name': item.get('distributor_name', ''),
            'timestamp': item.get('timestamp', ''),
            'unit_price': unit_price_str,
            'sales_order_status': item.get('sales_order_status', ''),
            'product_code': item.get('product_code', ''),
            'patientemail': item.get('patientemail', ''),
            'product_id': item.get('product_id', ''),
            'UserId': item.get('UserId', ''),
            'nickname': item.get('nickname', ''),
            'tracking_status': item.get('tracking_status', ''),
            'category': item.get('category', ''),
            'username': item.get('username', ''),
            'doctorsname': item.get('doctorsname', ''),
            'group_title': item.get('group_title', ''),
            'patientname': item.get('patientname', ''),
            'product_group': item.get('product_group', '')
        })
    
    # Construct the final response
    response_data = []
    for product_group, data in product_group_data.items():
        response_data.append({
            'product_group': product_group,
            'Sale_Count': data['Sale_Count'],
            'Lead_Count': data['Lead_Count'],
            'Total_Count': data['Total_Count'],
            'Total_revenue': data['Total_revenue'],
            'Matching_Records': data['Matching_Records'],
            'totalQuantity': 0,  # These fields are placeholders
            'revenue': 0        # Add appropriate values if necessary
        })
    
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

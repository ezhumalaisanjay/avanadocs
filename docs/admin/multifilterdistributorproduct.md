# Multi Filter Distributor Product Group 

### API Overview
- **Resource Name:** `multi_filter_distributor`
- **Sub Resource Name:** `multi_filter_distributor_product_group`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/multi_filter_distributor/multi_filter_distributor_product_group`
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
    table = dynamodb.Table(table_name)
    
    # Check if a list of distributor names is provided
    if 'distributor_name' in event and isinstance(event['distributor_name'], list):
        distributor_names = event['distributor_name']
    else:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'distributor_names must be a list'})
        }
    
    # Define filter expressions based on provided event parameters
    filter_expressions = []
    
    if 'category' in event:
        filter_expressions.append(Key('category').eq(event['category']))
    if 'start_date' in event and 'end_date' in event:
        filter_expressions.append(Attr('dates').between(event['start_date'], event['end_date']))
    if 'doctorsname' in event:
        filter_expressions.append(Attr('doctorsname').eq(event['doctorsname']))
    if 'tracking_status' in event:
        filter_expressions.append(Attr('tracking_status').eq(event['tracking_status']))
    if 'product_group' in event:
        filter_expressions.append(Attr('product_group').eq(event['product_group']))
    if 'group_title' in event:
        if event['group_title']:
            filter_expressions.append(Attr('group_title').eq(event['group_title']))
        else:
            filter_expressions.append(Attr('group_title').exists())
    
    # Initialize overall counts and revenue
    overall_sale_count = 0
    overall_lead_count = 0
    overall_total_count = 0
    overall_total_revenue = 0
    
    # Initialize an empty list to store all items
    all_items = []

    # Iterate over each distributor name and query the DynamoDB table
    for distributor_name in distributor_names:
        last_evaluated_key = None
        
        while True:
            # Add distributor_name to the filter expressions
            distributor_filter = Attr('distributor_name').eq(distributor_name)
            current_filter_expressions = filter_expressions + [distributor_filter]
            
            # Query records from DynamoDB with filtering
            query_params = {
                'FilterExpression': reduce(lambda x, y: x & y, current_filter_expressions)
            }
            if last_evaluated_key:
                query_params['ExclusiveStartKey'] = last_evaluated_key
            
            response = table.scan(**query_params)
            
            # Append items from the current response to the list
            all_items.extend(response['Items'])
            
            # Update overall counts and revenue
            for item in response['Items']:
                tracking_status = item.get('tracking_status')
                quantity = safe_int(item.get('quantity'))
                unit_price = safe_float(item.get('unit_price'))
                
                # Calculate revenue for the item
                revenue = quantity * unit_price
                
                # Update overall counts based on tracking_status
                if tracking_status == 'Sale':
                    overall_sale_count += quantity
                    overall_lead_count += quantity  # Include sales in lead count as well
                elif tracking_status == 'Lead':
                    overall_lead_count += quantity
                
                # Update overall totals
                overall_total_count += quantity
                overall_total_revenue += revenue
            
            # Check for more items
            last_evaluated_key = response.get('LastEvaluatedKey')
            if not last_evaluated_key:
                break
    
    # Prepare response data
    aggregated_info = prepare_response_data(all_items)
    
    # Construct the final response
    result = {
        'overall_sale_count': overall_sale_count,
        'overall_lead_count': overall_lead_count,
        'overall_total_count': overall_total_count,
        'overall_total_revenue': overall_total_revenue,
        'overall_total_records': len(all_items),
        'aggregated_info': aggregated_info
    }
    
    return {
        'statusCode': 200,
        'body': json.dumps(result)
    }

def safe_int(value, default=0):
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

def safe_float(value, default=0.0):
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

def prepare_response_data(items):
    consolidated_records = {}
    for item in items:
        product_group = item.get('product_group', '')
        distributor_name = item.get('distributor_name', '')
        tracking_status = item.get('tracking_status', '')
        quantity = safe_int(item.get('quantity'))
        unit_price = safe_float(item.get('unit_price'))
        revenue = quantity * unit_price
        
        key = (product_group, distributor_name)
        
        if key not in consolidated_records:
            consolidated_records[key] = {
                'product_group': product_group,
                'distributor_name': distributor_name,
                'Sale_Count': 0,
                'Lead_Count': 0,
                'Total_Count': 0,
                'Total_revenue': 0,
                'product_details': []
            }
        
        if tracking_status == 'Sale':
            consolidated_records[key]['Sale_Count'] += quantity
        elif tracking_status == 'Lead':
            consolidated_records[key]['Lead_Count'] += quantity
        
        consolidated_records[key]['Total_Count'] += quantity
        consolidated_records[key]['Total_revenue'] += revenue
        
        consolidated_records[key]['product_details'].append({
            'unit_price': item.get('unit_price', '0'),
            'patientnumber': item.get('patientnumber', ''),
            'quantity': item.get('quantity', '0'),
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
        })
    
    return list(consolidated_records.values())


```

---

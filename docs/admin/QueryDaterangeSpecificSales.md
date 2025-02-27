# Query Daterange Specific Sales

### API Overview
- **Resource Name:** `Query_date_range_specific_sales`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Query_date_range_specific_sales`
- **Lambda Function:** `Query_date_range_specific_sales`

---


### Lambda Function
```python
import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
from functools import reduce  # Import reduce from functools

def lambda_handler(event, context):
    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    
    # Define table name
    table_name = 'Avana'
    
    # Define partition key attribute
    partition_key = 'category'
    
    # Define key to sort by
    sort_key = 'dates'  # Replace 'dates' with the actual key
    
    # Get the category from the event input
    category = event['category']
    
    # Initialize filter expressions
    filter_expressions = [
        Key(partition_key).eq(category),
        Attr('tracking_status').eq(event['tracking_status'])  # Add tracking_status filter
    ]
            
    # Check if distributor_name is provided in the event
    if 'distributor_name' in event:
        filter_expressions.append(Attr('distributor_name').eq(event['distributor_name']))

    # Check if product_code is provided in the event
    if 'product_code' in event:
        filter_expressions.append(Attr('product_code').eq(event['product_code']))
    
    # Check if start_date and end_date are provided in the event
    if 'start_date' in event and 'end_date' in event:
        filter_expressions.append(Attr('dates').between(event['start_date'], event['end_date']))
        
    if 'doctorsname' in event:
        filter_expressions.append(Attr('doctorsname').eq(event['doctorsname']))
        
    # Check if group_title is provided in the event and if it's not empty
    if 'group_title' in event and event['group_title']:
        filter_expressions.append(Attr('group_title').eq(event['group_title']))
    
    # Get the DynamoDB table object
    table = dynamodb.Table(table_name)
    
    # Initialize an empty list to store all items
    all_items = []
    
    # Pagination loop
    last_evaluated_key = None
    while True:
        # Query records from DynamoDB with filtering
        query_params = {
            'KeyConditionExpression': filter_expressions[0],
            'FilterExpression': reduce(lambda x, y: x & y, filter_expressions[1:]) if len(filter_expressions) > 1 else None
        }
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
    
    # Sort all items based on the specified key with handling for None values
    sorted_response = sorted(all_items, key=lambda x: x.get(sort_key, ''), reverse=True)
    
    # Count the total number of items in the response
    total_count = len(sorted_response)
    
    # Create a dictionary containing the count and sorted items
    result = {
        'totalCount': total_count,
        'items': sorted_response
    }

    # Return the result as JSON
    return json.dumps(result)


```

---


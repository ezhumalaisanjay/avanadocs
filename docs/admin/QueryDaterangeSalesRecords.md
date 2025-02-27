# Query Daterange Sales Records

### API Overview
- **Resource Name:** `Query_date_range_sales_records`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Query_date_range_sales_records`
- **Lambda Function:** `Query_date_range_sales_records`

---


### Lambda Function
```python
import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

def lambda_handler(event, context):
    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    
    # Define table name
    table_name = 'Avana'
    
    # Define partition key attribute
    partition_key = 'category'
    
    # Define key to sort by
    sort_key = 'dates'  # Replace 'dates' with the actual key
    
    # Get the category, start_date, and end_date from the event input
    category = event['category']
    start_date = event['start_date']
    end_date = event['end_date']
    
    # Get the DynamoDB table object
    table = dynamodb.Table(table_name)
    
    # Initialize an empty list to store all items
    all_items = []
    
    # Pagination loop
    last_evaluated_key = None
    while True:
        # Query records from DynamoDB with filtering
        query_params = {
            'KeyConditionExpression': Key(partition_key).eq(category),
            'FilterExpression': Attr('dates').between(start_date, end_date)
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


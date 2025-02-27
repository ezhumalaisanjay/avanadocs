# Get All Category

### API Overview
- **Resource Name:** `get_all_category`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/get_all_category`
- **Lambda Function:** `getallcategory`

---


### Lambda Function
```python
import json
import boto3
from decimal import Decimal
from concurrent.futures import ThreadPoolExecutor, TimeoutError

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return str(o)
        return super(DecimalEncoder, self).default(o)
        
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
    
    # Get the DynamoDB table object
    table = dynamodb.Table(table_name)
    
    # Initialize an empty list to store all items
    all_items = []
    
    # Function to query records from DynamoDB
    def query_dynamodb(start_key):
        query_params = {
            'KeyConditionExpression': boto3.dynamodb.conditions.Key(partition_key).eq(category),
        }
        if start_key:
            query_params['ExclusiveStartKey'] = start_key
        response = table.query(**query_params)
        return response['Items'], response.get('LastEvaluatedKey')
    
    # Concurrently query records from DynamoDB
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = []
        last_evaluated_key = None
        while True:
            future = executor.submit(query_dynamodb, last_evaluated_key)
            futures.append(future)
            last_evaluated_key = future.result()[1]
            if not last_evaluated_key:
                break
        
        # Gather results from futures with a timeout of 5 seconds
        try:
            for future in futures:
                items, _ = future.result(timeout=5)
                all_items.extend(items)
        except TimeoutError:
            pass  # Ignore timeout
        
    # Sort all items based on the specified key with handling for None values
    sorted_response = sorted(all_items, key=lambda x: x.get(sort_key, ''), reverse=True)
    
    # Count the total number of items in the response
    total_count = len(sorted_response)
    
    # Create a dictionary containing the count and sorted items
    result = {
        'totalCount': total_count,
        'items': sorted_response
    }

    # Return the result as JSON using custom encoder
    return json.dumps(result, cls=DecimalEncoder)


```

---


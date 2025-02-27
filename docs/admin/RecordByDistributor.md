# Records By Distributor

### API Overview
- **Resource Name:** `Record_by_distributor`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Record_by_distributor`
- **Lambda Function:** `Record_by_distributor`

---


### Lambda Function
```python
import boto3
import json
from boto3.dynamodb.conditions import Key

def lambda_handler(event, context):
    # Extract parameters from the event
    dynamodb_table_name = "Avana"
    category = event['category']
    distributor_name = event['distributor_name']
    
    # Create the DynamoDB resource
    dynamodb = boto3.resource('dynamodb')

    # Get the DynamoDB table
    table = dynamodb.Table(dynamodb_table_name)

    # Initialize variables for pagination
    items = []
    last_evaluated_key = None
    
    while True:
        # Construct query parameters
        query_params = {
            'KeyConditionExpression': Key('category').eq(category),
            'FilterExpression': Key('distributor_name').eq(distributor_name),
            'ScanIndexForward': False
        }
        
        # If we have a LastEvaluatedKey from a previous iteration, use it for pagination
        if last_evaluated_key:
            query_params['ExclusiveStartKey'] = last_evaluated_key
        
        # Query the DynamoDB table
        response = table.query(**query_params)
        queried_items = response.get('Items', [])
        
        # Append queried items to the result list
        items.extend(queried_items)
        
        # Check if there are more items to fetch
        last_evaluated_key = response.get('LastEvaluatedKey')
        if not last_evaluated_key:
            break  # No more items to fetch, exit the loop
            
    # Sort items by the 'dates' attribute in descending order
    sorted_items = sorted(items, key=lambda x: x.get('dates', ''), reverse=True)
    
    # Convert the sorted items to JSON
    response_json = json.dumps(sorted_items)
    
    # Return the response JSON
    return {
        'statusCode': 200,
        'body': response_json
    }


```

---


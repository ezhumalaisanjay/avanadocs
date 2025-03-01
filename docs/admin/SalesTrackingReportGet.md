# Sales Tracking Report Get

### API Overview
- **Resource Name:** `sales_tracking`
- **Sub Resource Name:** `sales_trcking_report`
- **Method:** `GET`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking/sales_trcking_report`
- **Lambda Function:** `sales`

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    # Replace 'your-dynamodb-table-name' with the actual name of your DynamoDB table
    dynamodb_table_name = 'Avana'
    
    # Check if the event has distributor_name or UserId
    if 'distributor_name' in event:
        key_name = 'distributor_name'
        key_value = event['distributor_name']
    elif 'UserId' in event:
        key_name = 'UserId'
        key_value = event['UserId']
    else:
        return {
            'statusCode': 400,
            'body': 'Missing distributor_name or UserId in the event'
        }

    category = event.get('category', '')  # This is the partition key (category) value
    print(category)
    print(key_name)
    print(key_value)
    
    # Create the DynamoDB resource
    dynamodb = boto3.resource('dynamodb')

    # Get the DynamoDB table
    table = dynamodb.Table(dynamodb_table_name)
    print(table)
    
    # Initialize variables for pagination
    items = []
    last_evaluated_key = None
    
    while True:
        # Define the filter expression
        filter_expression = f'#{key_name} = :val'
        
        # Define the expression attribute values
        expression_attribute_values = {':val': key_value}
        expression_attribute_names = {'#' + key_name: key_name}
        
        # Construct query parameters
        query_params = {
            'KeyConditionExpression': 'category = :category',
            'FilterExpression': filter_expression,
            'ExpressionAttributeValues': {
                ':category': category,
                **expression_attribute_values
            },
            'ExpressionAttributeNames': expression_attribute_names,
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
    
    print(items)
    
    return {
        'statusCode': 200,
        'body': json.dumps(items, default=str)
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
                "dynamodb:Query"
            ],
            "Resource": [
                "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Avana"
            ]
        }
    ]
}

```
---

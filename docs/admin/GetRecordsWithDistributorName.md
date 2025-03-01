# Get Records With Distributor Name

### API Overview
- **Resource Name:** `Get_records_with_distributor_name`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Get_records_with_distributor_name`
- **Lambda Function:** `Get_records_with_distributor_name`

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    # Initialize DynamoDB client
    dynamodb = boto3.client('dynamodb')
    
    # Define category as partition key
    category = 'sales tracking'
    
    # List to store retrieved records
    records = []
    last_evaluated_key = None
    
    # Iterate through each user ID in the event
    for user in event:
        user_id = user['UserId']
        
        while True:
            # Define key condition expression and filter expression
            key_condition_expression = '#category = :category'
            filter_expression = '#UserId = :user_id'
            expression_attribute_names = {'#category': 'category', '#UserId': 'UserId'}
            expression_attribute_values = {':category': {'S': category}, ':user_id': {'S': user_id}}
            
            # Define query_params dictionary
            query_params = {
                'TableName': 'Avana',
                'KeyConditionExpression': key_condition_expression,
                'FilterExpression': filter_expression,
                'ExpressionAttributeNames': expression_attribute_names,
                'ExpressionAttributeValues': expression_attribute_values
            }
            
            # Add last evaluated key to the query if present
            if last_evaluated_key:
                query_params['ExclusiveStartKey'] = last_evaluated_key
            
            # Query DynamoDB
            response = dynamodb.query(**query_params)
            
            # Add retrieved records to the list and convert attribute values to strings
            for item in response['Items']:
                for key, value in item.items():
                    if isinstance(value, dict) and 'S' in value:
                        item[key] = value['S']
                records.append(item)
            
            # Update last evaluated key for pagination
            last_evaluated_key = response.get('LastEvaluatedKey')
            
            # Break the loop if there are no more items
            if not last_evaluated_key:
                break
    
    # Sort records by dates attribute in descending order
    sorted_records = sorted(records, key=lambda x: x['dates'], reverse=True)
    
    # Return the sorted records as JSON
    return json.dumps(sorted_records)


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
            "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/Avana"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-east-1:123456789012:*"
        }
    ]
}

```
---


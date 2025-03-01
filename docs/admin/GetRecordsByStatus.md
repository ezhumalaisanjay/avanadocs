# Get Records By Status

### API Overview
- **Resource Name:** `get_record_by_status`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/get_record_by_status`
- **Lambda Function:** `getrecord_by_status`

---


### Lambda Function
```python
import boto3
from boto3.dynamodb.conditions import Key, Attr

def lambda_handler(event, context):
    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    
    # Specify the DynamoDB table name
    table_name = 'Avana'
    
    # Specify the category value for the partition key
    category = event['category']
    
    # Specify the tracking status for the filter expression
    tracking_status = event['tracking_status']
    
    # Define the filter expression
    filter_expression = Attr('tracking_status').eq(tracking_status)
    
    # Retrieve data from DynamoDB based on category and filter expression using query
    table = dynamodb.Table(table_name)
    
    # Initialize an empty list to store all items
    all_items = []
    
    # Pagination loop
    last_evaluated_key = None
    while True:
        # Query records from DynamoDB
        query_params = {
            'KeyConditionExpression': Key('category').eq(category),
            'FilterExpression': filter_expression
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
    
    # Sort the items based on the dates attribute in descending order
    sorted_items = sorted(all_items, key=lambda x: x.get('dates', ''), reverse=True)
    
    # Return the sorted items
    return sorted_items


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
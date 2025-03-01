# Get Sale Status

### API Overview
- **Resource Name:** `sales_tracking`
- **Sub Resource Name:** `get_sale_status`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking/get_sale_status`
- **Lambda Function:** `Avana_get_sale_status_records`

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    # Replace 'your-dynamodb-table-name' with the actual name of your DynamoDB table
    dynamodb_table_name = 'Avana'
    category = event['category']  # This is the partition key (category) value
    status = event.get('tracking_status')  # Assuming you pass the 'team' attribute in the event
    group_title = event.get('group_title')
    user_id = event.get('UserId')
    distributor_name = event.get('distributor_name')  # Add distributor_name

    # Create the DynamoDB resource
    dynamodb = boto3.resource('dynamodb')

    # Get the DynamoDB table
    table = dynamodb.Table(dynamodb_table_name)

    # Define the filter expression with 'group', 'team', 'UserId', and 'distributor_name' attributes
    filter_expression = 'tracking_status = :val_status AND distributor_name = :val_distributor_name AND group_title = :val_group_title OR (tracking_status = :val_status AND distributor_name = :val_distributor_name AND UserId = :val_user_id)'

    # Define the expression attribute values
    expression_attribute_values = {
        ':val_status': status,
        ':val_group_title': group_title,
        ':val_user_id': user_id,
        ':val_distributor_name': distributor_name  # Add distributor_name
    }

    items = []
    last_evaluated_key = None

    while True:
        # Query the DynamoDB table
        query_params = {
            'KeyConditionExpression': 'category = :category',
            'FilterExpression': filter_expression,
            'ExpressionAttributeValues': {
                ':category': category,
                **expression_attribute_values
            }
        }

        if last_evaluated_key:
            query_params['ExclusiveStartKey'] = last_evaluated_key

        response = table.query(**query_params)

        # Get the items from the response
        items.extend(response.get('Items', []))

        # Set LastEvaluatedKey for pagination
        last_evaluated_key = response.get('LastEvaluatedKey')

        if not last_evaluated_key:
            break  # Break the loop if there are no more items to fetch

    # Sort the items by the 'dates' attribute in descending order
    sorted_items = sorted(items, key=lambda x: x.get('dates', ''), reverse=True)

    return {
        'statusCode': 200,
        'body': json.dumps({'items': sorted_items}, default=str)
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
                "dynamodb:GetItem"
            ],
            "Resource": "arn:aws:dynamodb:<region>:<account-id>:table/Avana"
        },
        {
            "Effect": "Allow",
            "Action": "logs:CreateLogGroup",
            "Resource": "arn:aws:logs:<region>:<account-id>:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:<region>:<account-id>:log-group:/aws/lambda/*"
        }
    ]
}

```
---



# Request Level 2 Approval

## API Overview

- **Resource Name:** `request`
- **Sub Resource Name:** `level_2_approval`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/request/level_2_approval`
- **Lambda Function:** `get_approval_MEAR`



## **Lambda Function**

```python
import boto3
import json
from boto3.dynamodb.conditions import Key

def lambda_handler(event, context):
    try:
        dynamodb_table_name = 'Avana'
        category = event['category']
        request_status = event['request_status']
        
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(dynamodb_table_name)
        
        filter_expression = '#request_status = :val'
        expression_attribute_names = {'#request_status': 'request_status'}
        expression_attribute_values = {
            ':val': request_status,
            ':category': category
        }
        
        response = table.query(
            KeyConditionExpression=Key('category').eq(category),
            FilterExpression=filter_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names
        )
        
        items = response.get('Items', [])
        
        return {
            'statusCode': 200,
            'body': json.dumps(items, default=str)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }
```
---

## **IAM Policy for Lambda Execution Role**

Attach this policy to the Lambda execution role to allow access to DynamoDB and CloudWatch.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:Query"
            ],
            "Resource": "arn:aws:dynamodb:us-west-2:YOUR_AWS_ACCOUNT_ID:table/Avana"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-west-2:YOUR_AWS_ACCOUNT_ID:*"
        }
    ]
}
```

Replace `YOUR_AWS_ACCOUNT_ID` with your actual AWS account ID.

---

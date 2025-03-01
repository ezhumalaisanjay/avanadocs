# Request Form

## API Overview

- **Resource Name:** `request`
- **Sub Resource Name:** `request_form`
- **Method:** `POST`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/request/request_form`
- **Lambda Function:** `avana_request_add`



## **Lambda Function**

```python
import json
import boto3
from datetime import datetime

def lambda_handler(event, context):
    try:
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('Avana')

        if isinstance(event, dict):
            event["timestamp"] = datetime.now().isoformat(timespec='microseconds')
            table.put_item(Item=event)
            return {
                'statusCode': 200,
                'body': json.dumps('Request form submitted successfully!')
            }
        else:
            return {
                'statusCode': 400,
                'body': json.dumps('Invalid event format')
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
                "dynamodb:PutItem"
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

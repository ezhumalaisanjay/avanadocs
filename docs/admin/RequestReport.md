# Request Report

## API Overview

- **Resource Name:** `request`
- **Sub Resource Name:** `request_report`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/request/request_report`
- **Lambda Function:** `avana_get_request_user`



## **Lambda Function**

```python
import json
import boto3

dynamodb = boto3.client('dynamodb')
table_name = 'Avana'

def lambda_handler(event, context):
    try:
        category = event.get("category")
        userid = event.get("UserId")

        if userid is None or not isinstance(userid, str):
            return {
                "statusCode": 400,
                "body": json.dumps("Invalid or missing 'UserId' in the input event.")
            }

        response = dynamodb.query(
            TableName=table_name,
            KeyConditionExpression="category = :cat",
            FilterExpression="UserId = :uid",
            ExpressionAttributeValues={
                ":cat": {"S": category},
                ":uid": {"S": userid}
            }
        )

        items = response.get("Items", [])
        data = [dict((k, v.get('S', v.get('N'))) for k, v in item.items()) for item in items]

        return {
            "statusCode": 200,
            "body": json.dumps(data)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(f"Error retrieving data from Avana table: {str(e)}")
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

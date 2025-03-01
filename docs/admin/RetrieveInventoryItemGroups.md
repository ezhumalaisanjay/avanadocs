# Retrieve Inventory Item Groups

## API Overview

- **Resource Name:** `Retrieve_inventory_item_groups`
- **Method:** `GET`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Retrieve_inventory_item_groups`
- **Lambda Function:** `Retrieve_inventory_item_groups`



## **Lambda Function**

```python
import requests
import json
import boto3

dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    try:
        category = "access_token_inventory"
        timestamp = "2023-10-22T12:00:05.955636"
        
        response = dynamodb.query(
            TableName='Avana',
            KeyConditionExpression='#category = :category AND #timestamp = :timestamp',
            ExpressionAttributeNames={'#category': 'category', '#timestamp': 'timestamp'},
            ExpressionAttributeValues={':category': {'S': category}, ':timestamp': {'S': timestamp}}
        )
        
        items = response.get('Items', [])
        if not items:
            return {
                'statusCode': 404,
                'body': json.dumps("Access token not found.")
            }
        
        access_token = items[0]["access_tokens"]["S"]
        
        url = "https://www.zohoapis.in/inventory/v1/itemgroups?organization_id=60026284908&page=1&per_page=50"
        headers = {'Authorization': f'Zoho-oauthtoken {access_token}'}
        
        response = requests.get(url, headers=headers)
        
        response_data = {
            'status_code': response.status_code,
            'headers': dict(response.headers),
            'text': response.text
        }
        
        return {
            'statusCode': 200,
            'body': json.dumps(response_data)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }
```
---

## **IAM Policy for Lambda Execution Role**

Attach this policy to the Lambda execution role to allow access to DynamoDB, CloudWatch, and external API requests.

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
        },
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Resource": "arn:aws:secretsmanager:us-west-2:YOUR_AWS_ACCOUNT_ID:secret/*"
        }
    ]
}
```

Replace `YOUR_AWS_ACCOUNT_ID` with your actual AWS account ID.

---

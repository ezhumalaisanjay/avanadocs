# Records By Distributor

## API Overview

- **Resource Name:** `Record_by_distributor`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Record_by_distributor`
- **Lambda Function:** `Record_by_distributor`


## **Lambda Function**

```python
import boto3
import json
from boto3.dynamodb.conditions import Key

def lambda_handler(event, context):
    try:
        dynamodb_table_name = "Avana"
        category = event['category']
        distributor_name = event['distributor_name']
        
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(dynamodb_table_name)
        
        items = []
        last_evaluated_key = None
        
        while True:
            query_params = {
                'KeyConditionExpression': Key('category').eq(category),
                'FilterExpression': Key('distributor_name').eq(distributor_name),
                'ScanIndexForward': False
            }
            
            if last_evaluated_key:
                query_params['ExclusiveStartKey'] = last_evaluated_key
            
            response = table.query(**query_params)
            queried_items = response.get('Items', [])
            
            items.extend(queried_items)
            last_evaluated_key = response.get('LastEvaluatedKey')
            if not last_evaluated_key:
                break
                
        sorted_items = sorted(items, key=lambda x: x.get('dates', ''), reverse=True)
        response_json = json.dumps(sorted_items)
        
        return {
            'statusCode': 200,
            'body': response_json
        }
    except Exception as e:
        print(f'Error: {str(e)}')
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
                "dynamodb:Query",
                "dynamodb:GetItem"
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

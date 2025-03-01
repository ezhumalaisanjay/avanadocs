# Query Daterange Sales Records

## API Overview

- **Resource Name:** `Query_date_range_sales_records`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Query_date_range_sales_records`
- **Lambda Function:** `Query_date_range_sales_records`



## **Lambda Function**

```python
import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

def lambda_handler(event, context):
    try:
        dynamodb = boto3.resource('dynamodb')
        table_name = 'Avana'
        table = dynamodb.Table(table_name)
        
        category = event['category']
        start_date = event['start_date']
        end_date = event['end_date']
        
        all_items = []
        last_evaluated_key = None
        
        while True:
            query_params = {
                'KeyConditionExpression': Key('category').eq(category),
                'FilterExpression': Attr('dates').between(start_date, end_date)
            }
            
            if last_evaluated_key:
                query_params['ExclusiveStartKey'] = last_evaluated_key
            
            response = table.query(**query_params)
            all_items.extend(response['Items'])
            last_evaluated_key = response.get('LastEvaluatedKey')
            
            if not last_evaluated_key:
                break
        
        sorted_response = sorted(all_items, key=lambda x: x.get('dates', ''), reverse=True)
        total_count = len(sorted_response)
        
        result = {
            'totalCount': total_count,
            'items': sorted_response
        }
        
        return json.dumps(result)
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal Server Error', 'error': str(e)})
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

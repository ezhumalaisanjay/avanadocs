# Query Daterange Specific Sales

## API Overview

- **Resource Name:** `Query_date_range_specific_sales`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Query_date_range_specific_sales`
- **Lambda Function:** `Query_date_range_specific_sales`



## **Lambda Function**

```python
import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
from functools import reduce

def lambda_handler(event, context):
    try:
        dynamodb = boto3.resource('dynamodb')
        table_name = 'Avana'
        table = dynamodb.Table(table_name)
        
        category = event['category']
        filter_expressions = [
            Key('category').eq(category),
            Attr('tracking_status').eq(event['tracking_status'])
        ]
        
        if 'distributor_name' in event:
            filter_expressions.append(Attr('distributor_name').eq(event['distributor_name']))
        if 'product_code' in event:
            filter_expressions.append(Attr('product_code').eq(event['product_code']))
        if 'start_date' in event and 'end_date' in event:
            filter_expressions.append(Attr('dates').between(event['start_date'], event['end_date']))
        if 'doctorsname' in event:
            filter_expressions.append(Attr('doctorsname').eq(event['doctorsname']))
        if 'group_title' in event and event['group_title']:
            filter_expressions.append(Attr('group_title').eq(event['group_title']))
        
        all_items = []
        last_evaluated_key = None
        
        while True:
            query_params = {
                'KeyConditionExpression': filter_expressions[0],
                'FilterExpression': reduce(lambda x, y: x & y, filter_expressions[1:]) if len(filter_expressions) > 1 else None
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

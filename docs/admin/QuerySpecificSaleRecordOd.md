# Query Daterange Specific Sales Od

## API Overview

- **Resource Name:** `Query_date_range_specific_sales_od`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Query_date_range_specific_sales_od`
- **Lambda Function:** `Query_date_range_specific_sales_Oder`



Replace `YOUR_AWS_ACCOUNT_ID` with your actual AWS account ID.

---

## **Lambda Function**

```python
import json
from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Key, Attr

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    try:
        category = event.get("category")
        start_date = event.get("start_date")
        end_date = event.get("end_date")
        distributor_name = event.get("distributor_name")

        if not category:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing or invalid parameter: category')
            }

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('Avana')

        key_condition_expr = Key('category').eq(category)
        filter_expr = None
        
        if start_date and end_date:
            filter_expr = Attr('dates').between(start_date, end_date)
        if distributor_name:
            filter_expr_distributor = Attr('distributor_name').eq(distributor_name)
            filter_expr = filter_expr & filter_expr_distributor if filter_expr else filter_expr_distributor

        query_params = {'KeyConditionExpression': key_condition_expr}
        if filter_expr:
            query_params['FilterExpression'] = filter_expr

        response = table.query(**query_params)
        items = response.get('Items', [])
        items = sorted(items, key=lambda x: x.get('dates', ''), reverse=True)
        items = json.loads(json.dumps(items, default=decimal_default))

        return {
            'statusCode': 200,
            'body': json.dumps({
                'count': len(items),
                'items': items
            })
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

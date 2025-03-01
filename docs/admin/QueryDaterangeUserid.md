# Query Daterange Userid

## API Overview

- **Resource Name:** `query_daterange_userid`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/query_daterange_userid`
- **Lambda Function:** `Query_daterange_user_based`



## **Lambda Function**

```python
import boto3
import json

def lambda_handler(event, context):
    try:
        dynamodb = boto3.client('dynamodb')
        records = []
        last_evaluated_key = None
        
        for user_data in event:
            user_id = user_data['UserId']
            start_date = user_data.get('start_date')
            end_date = user_data.get('end_date')
            distributor_name = user_data.get('distributor_name')
            doctors_name = user_data.get('doctorsname')
            category_val = user_data.get('category')
            
            filter_expression = '#UserId = :user_id'
            expression_attribute_names = {'#UserId': 'UserId'}
            expression_attribute_values = {':user_id': {'S': user_id}}
            
            if category_val:
                expression_attribute_values[':category_val'] = {'S': category_val}
            if start_date and end_date:
                filter_expression += ' AND #dates BETWEEN :start_date AND :end_date'
                expression_attribute_names['#dates'] = 'dates'
                expression_attribute_values[':start_date'] = {'S': start_date}
                expression_attribute_values[':end_date'] = {'S': end_date}
            if distributor_name:
                filter_expression += ' AND #distributor_name = :distributor_name'
                expression_attribute_names['#distributor_name'] = 'distributor_name'
                expression_attribute_values[':distributor_name'] = {'S': distributor_name}
            if doctors_name:
                filter_expression += ' AND #doctorsname = :doctorsname'
                expression_attribute_names['#doctorsname'] = 'doctorsname'
                expression_attribute_values[':doctorsname'] = {'S': doctors_name}
            
            while True:
                query_params = {
                    'TableName': 'Avana',
                    'KeyConditionExpression': 'category = :category_val',
                    'FilterExpression': filter_expression,
                    'ExpressionAttributeNames': expression_attribute_names,
                    'ExpressionAttributeValues': expression_attribute_values
                }
                
                if last_evaluated_key:
                    query_params['ExclusiveStartKey'] = last_evaluated_key
                
                response = dynamodb.query(**query_params)
                
                for item in response['Items']:
                    for key, value in item.items():
                        if isinstance(value, dict) and 'S' in value:
                            item[key] = value['S']
                    records.append(item)
                
                last_evaluated_key = response.get('LastEvaluatedKey')
                if not last_evaluated_key:
                    break
        
        sorted_records = sorted(records, key=lambda x: x['dates'], reverse=True)
        
        return json.dumps(sorted_records)
    except Exception as e:
        return {
            "errorMessage": str(e),
            "errorType": type(e).__name__
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

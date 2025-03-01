# Date Filter By Status

## Overview
- **Resource Name:**  `date_filter_by_status_distributor_record`  
- **Method:**  `PUT`  
- **Invoke URL:**  `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/date_filter_by_status_distributor_record`  


---

## Lambda Function Overview
```python
import boto3
from boto3.dynamodb.conditions import Key, Attr
import json
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return str(o)
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')

    result = []
    last_evaluated_key = None
    
    distributor_names = event['distributor_name']
    category = event['category']
    tracking_status = event['tracking_status']
    start_date = event.get('start_date')
    end_date = event.get('end_date')
    doctorsname = event.get('doctorsname')

    if category and tracking_status:
        for distributor_name in distributor_names:
            while True:
                filter_expression = (Attr('distributor_name').eq(distributor_name) &
                                     Attr('tracking_status').eq(tracking_status))
                
                if start_date and end_date:
                    filter_expression &= Attr('dates').between(start_date, end_date)
                
                if doctorsname:
                    filter_expression &= Attr('doctorsname').eq(doctorsname)
                
                query_params = {
                    'KeyConditionExpression': Key('category').eq(category),
                    'FilterExpression': filter_expression
                }
                
                if last_evaluated_key:
                    query_params['ExclusiveStartKey'] = last_evaluated_key
                
                response = table.query(**query_params)
                result.extend(response['Items'])
                
                last_evaluated_key = response.get('LastEvaluatedKey')
                
                if not last_evaluated_key:
                    break
    else:
        print("Category or tracking status is missing in the event data.")
    
    sorted_result = sorted(result, key=lambda x: x.get('dates', ''), reverse=True)
    
    return json.dumps(sorted_result, cls=DecimalEncoder)
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
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-west-2:YOUR_ACCOUNT_ID:table/Avana"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:us-west-2:YOUR_ACCOUNT_ID:log-group:/aws/lambda/YOUR_LAMBDA_FUNCTION_NAME:*"
      ]
    }
  ]
}


```
---


## Notes
- Ensure the `Avana` table exists and has a partition key of `category`.
- Results are sorted by the `dates` field in descending order.
- Fields like `start_date`, `end_date`, and `doctorsname` are optional filters.
- Handles pagination through `LastEvaluatedKey` for large data sets.


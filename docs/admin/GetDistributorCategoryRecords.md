# Get Distributor Category Records

### API Overview
- **Resource Name:** `Get_status_distributor_category_records`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Get_status_distributor_category_records`
- **Lambda Function:** `Get_status_distributor_category_records`

---


### Lambda Function
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
    table = dynamodb.Table('Avana')  # Replace 'your_table_name' with your actual table name

    result = []
    last_evaluated_key = None
    
    for record in event:
        category = record['category']
        distributor_name = record['distributor_name']
        tracking_status = record['tracking_status']  # Added tracking_status
        
        while True:
            query_params = {
                'KeyConditionExpression': Key('category').eq(category),
                'FilterExpression': Attr('distributor_name').eq(distributor_name) & Attr('tracking_status').eq(tracking_status)  # Modified filter expression
            }
            if last_evaluated_key:
                query_params['ExclusiveStartKey'] = last_evaluated_key
            
            response = table.query(**query_params)
            result.extend(response['Items'])
            
            last_evaluated_key = response.get('LastEvaluatedKey')
            
            if not last_evaluated_key:
                break
    
    # Sort the result by descending order of dates
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
            "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/Avana"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-east-1:123456789012:*"
        }
    ]
}

```
---


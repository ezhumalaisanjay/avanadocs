# Sales tracking Distributor Sales Post

### API Overview
- **Resource Name:** `sales_tracking_distributorsales_post`
- **Method:** `POST`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking_distributorsales_post`
- **Lambda Function:** `avana_distributorsales_post`

---


### Lambda Function
```python
import boto3
import json
from datetime import datetime
from decimal import Decimal
from boto3.dynamodb.conditions import Key

client = boto3.resource("dynamodb")
table = client.Table("Avana") 

def lambda_handler(event, context):
    # Convert any float values to Decimal
    event = convert_floats_to_decimal(event)
    
    event["timestamp"] = datetime.now().isoformat(timespec='microseconds')
    
    table.put_item(Item=event)
    
    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps(event,default=str)
    }

def convert_floats_to_decimal(data):
    if isinstance(data, float):
        return Decimal(str(data))
    elif isinstance(data, dict):
        return {key: convert_floats_to_decimal(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_floats_to_decimal(item) for item in data]
    return data


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
                "dynamodb:PutItem"
            ],
            "Resource": [
                "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Avana"
            ]
        }
    ]
}

```
---

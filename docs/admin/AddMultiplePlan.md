# Add Multiple Plan

### API Overview
- **Resource Name:** `travel_plan`
- **Sub Resource Name:** `add_mutiple_plan`
- **Method:** `POST`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/travel_plan/add_mutiple_plan`
- **Lambda Function:** `avana_Travel_Plan`

---


### Lambda Function
```python
import json
import boto3
from datetime import datetime,timezone
from boto3.dynamodb.conditions import Key
from boto3.dynamodb.conditions import Attr
from dateutil.tz import tzlocal

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')
    
    with table.batch_writer() as batch:
        for item in event:
            item["timestamp"] = datetime.now().isoformat(timespec='microseconds')
            batch.put_item(Item=item)

    return {
        'statusCode': 200,
        'body': json.dumps('Timesheet updated!')
    }

```

---


# New Work

### API Overview
- **Resource Name:** `work`
- **Sub Resource Name:** `new_work`
- **Method:** `POST`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/work/new_work`
- **Lambda Function:** `Avana_New_Work_Report`

---


### Lambda Function
```python
import boto3
import json
from datetime import datetime
from boto3.dynamodb.conditions import Key

client = boto3.resource("dynamodb")
table = client.Table("Avana") 

def lambda_handler(event, context):
    event["timestamp"] = datetime.now().isoformat(timespec='microseconds')
 
    
    table.put_item(Item = event)
    
    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps(event,default=str)
    }

```

---


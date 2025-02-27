# Level 2 Approval

### API Overview
- **Resource Name:** `level_2_approval`
- **Sub Resource Name:** `level_2_approval`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/level_2_approval`
- **Lambda Function:** ``

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    # TODO implement
    print(event)
    client = boto3.resource("dynamodb")
    table = client.Table("Avana")
    response1 = table.update_item(
        Key={
            'category': event['category'],
            'timestamp': event['timestamp']
        },
        UpdateExpression="set #st=:newStatus, #rs=:newRequestStatus",  # Add request_status update
        ExpressionAttributeNames={
            "#st": "status",
            "#rs": "request_status"  # Mapping reserved keyword "request_status" to expression attribute name "#rs"
        },
        ExpressionAttributeValues={
            ':newStatus': event['status'],
            ':newRequestStatus': event.get('request_status', '')  # Use a default value if request_status is not in the event
        }
    )
    return {
        'statusCode': 200,
        'body': json.dumps(response1, default=str)
    }


```

---

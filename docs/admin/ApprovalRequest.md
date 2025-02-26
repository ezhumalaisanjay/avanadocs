# Approval Request
 
## Overview 
- **Resource Name**: approval
- **Sub Resource Name**: request
- **Method**: PUT 
- **API URL**: [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/approval/request](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/approval/request) 
- **Lambda Function Name**: `avana_get_request_update` 
 
## Lambda Function
 
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
        UpdateExpression="set #st=:newStatus",
        ExpressionAttributeNames={
            "#st": "status"  # Mapping reserved keyword "status" to expression attribute name "#st"
        },
        ExpressionAttributeValues={
            ':newStatus': event['status']
        }
    )
    return {
        'statusCode': 200,
        'body': json.dumps(response1,default=str)
    }

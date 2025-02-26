# Approval Request
 
## Overview 
- **API Name**: Avana
- **Resource Name**: approval
- **Sub Resource Name**: request
- **Method**: PUT 
- **Resource ID**: 6478gx 
- **ARN**: `arn:aws:execute-api:us-west-2:600087091387:xqaizmksl2/*/PUT/approval/request` 
- **API URL**: [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/approval/request](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/approval/request) 
- **Lambda Function Name**: `avana_get_request_update` 
- **DynamoDB Table**: `Avana` 
 
## Description 
The **Approval Request API** updates the status of a record in the **Avana** DynamoDB 
table based on the provided `category` and `timestamp`. 
 
## Lambda Function
 
```python 
import boto3 
import json 
 
def lambda_handler(event, context): 
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
            "#st": "status"  # Mapping reserved keyword "status" to expression attribute name 
"#st" 
        }, 
        ExpressionAttributeValues={ 
            ':newStatus': event['status'] 
        } 
    ) 
 
    return { 
        'statusCode': 200, 
        'body': json.dumps(response1, default=str) 
    } 
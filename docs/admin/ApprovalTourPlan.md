# Approval Tour Plan

## Overview
- **Resource name**: `approval`
- **Sub Resource Name**: `tour_plan`
- **Method**: PUT
- **Invoke URL**: [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/approval/tour_plan](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/approval/tour_plan)
- **Lambda Function Name**: `Avana_Approval_Status_Work_Report`
---

## Lambda Function Implementation

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
        UpdateExpression="set #st=:newApproval_Status, #d=:newDates, #u=:newUserName, #r=:newRej",
        ExpressionAttributeNames={
            "#st": "Approval_Status",
            "#d": "rejdates",
            "#u": "UserName",
            "#r": "rej"
        },
        ExpressionAttributeValues={
            ':newApproval_Status': event['Approval_Status'],
            ':newDates': event['rejdates'],
            ':newUserName': event['UserName'],
            ':newRej': event['rej']
        }
    )
    return {
        'statusCode': 200,
        'body': json.dumps(response1, default=str)
    }
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
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:YOUR_REGION:YOUR_ACCOUNT_ID:table/Avana"
    }
  ]
}





```
---

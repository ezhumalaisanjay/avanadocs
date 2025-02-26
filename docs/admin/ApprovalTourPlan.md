# Approval Tour Plan

## Overview
- **API Name**: approval_tour_plan
- **Method**: PUT
- **Resource ID**: 4gasj0
- **ARN**: `arn:aws:execute-api:us-west-2:600087091387:xqaizmksl2/*/PUT/approval/tour_plan`
- **API URL**: [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/approval/tour_plan](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/approval/tour_plan)
- **Lambda Function Name**: `approval_tour_plan_lambda`
- **DynamoDB Table**: `Avana`

## Description
The **Approval Tour Plan API** updates the **Approval_Status**, **rejdates**, **UserName**, and **rej** fields for a specific record in the **Avana** DynamoDB table.

## Lambda Function Implementation

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

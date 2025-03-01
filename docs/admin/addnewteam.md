# Add New Team

## Overview
- **Invoke URL** :[`https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/add_new_team`](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/add_new_team)
- **Stage** : `test`
- **Resource Name** : `add_new_team`  
- **Method** : `PUT`  

## Lambda Function

```python
import json
import boto3

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table_name = 'Avana'  # Replace with your DynamoDB table name

    for user in event['Users']:
        category = user.get('category')
        timestamp = user.get('timestamp')
        team = event['team']

        # Update the DynamoDB record and conditionally create the 'team' attribute
        table = dynamodb.Table(table_name)
        response = table.update_item(
            Key={
                'category': category,
                'timestamp': timestamp
            },
            UpdateExpression="SET #team = if_not_exists(#team, :team)",
            ExpressionAttributeNames={
                '#team': 'team'
            },
            ExpressionAttributeValues={
                ':team': team
            },
            ReturnValues="UPDATED_NEW"
        )

        print(f"Updated item for category: {category}, timestamp: {timestamp}, team: {team}")

    return {
        'statusCode': 200,
        'body': json.dumps('Records updated successfully')
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
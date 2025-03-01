# Avana Create User

## Overview
- **Method**: `POST`
- **Resource Name**: `AvanaCreateuser`
- **Invoke URL**: [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/AvanaCreateuser](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/AvanaCreateuser)
- **Lambda Function Name**: `AvanaCreateuser`
- **Cognito User Pool ID**: `us-west-2_rpX7WI1w2` 
- **Notes** : `Replace your Cognito User Pool ID`
---

## Lambda Function

```python
import boto3
import json
from datetime import datetime
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    client = boto3.client('cognito-idp')
    dynamo = boto3.resource("dynamodb")
    table = dynamo.Table("Avana")
    USER_POOL_ID = 'us-west-2_rpX7WI1w2'
    response = {}

    try:
        if event['msg'] != "signup frontend":
            # Join the distributor names into a single string
            distributor_name_str = ', '.join(event["distributor_name"])
            
            # Create the user in Cognito
            response = client.admin_create_user(
                UserPoolId=USER_POOL_ID,
                Username=event['username'],
                DesiredDeliveryMediums=['EMAIL'],
                TemporaryPassword=event["password"],
                UserAttributes=[
                    {'Name': 'name', 'Value': event["username"]},
                    {'Name': 'profile', 'Value': event["profile"]},
                    {'Name': 'custom:distributor_name', 'Value': distributor_name_str},
                    {'Name': 'email', 'Value': event["email"]},
                    {'Name': 'phone_number', 'Value': event["phone_number"]},
                    {'Name': 'name', 'Value': event['name']},
                    {'Name': 'nickname', 'Value': event['nickname']},
                    {'Name': 'email_verified', 'Value': 'true'}
                ]
            )
            
            # Set the user password permanently
            client.admin_set_user_password(
                UserPoolId=USER_POOL_ID,
                Username=response["User"]["Username"],
                Password=event['password'],
                Permanent=True
            )
            
            event["UserId"] = response["User"]["Attributes"][0]["Value"]
        
        event["timestamp"] = datetime.now().isoformat(timespec='microseconds')
        
        # Add user to the specified group
        client.admin_add_user_to_group(
            UserPoolId=USER_POOL_ID,
            Username=event["username"],
            GroupName=event["GroupName"]
        )
        
        # Remove password from the event before storing in DynamoDB
        del event["password"]
        
        # Store the user data in DynamoDB
        table.put_item(Item=event)
    
        return {
            'statusCode': 200,
            'body': json.dumps(response, default=str)
        }
    
    except ClientError as e:
        print(f"An error occurred: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
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
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminAddUserToGroup"
      ],
      "Resource": [
        "arn:aws:cognito-idp:us-west-2:YOUR_ACCOUNT_ID:userpool/YOUR_USER_POOL_ID"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-west-2:YOUR_ACCOUNT_ID:table/Avana"
      ]
    }
  ]
}

```
---

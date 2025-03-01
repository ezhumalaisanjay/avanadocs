# User Profile Update

### API Overview
- **Resource Name:** `userprofile_Update`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/userprofile_Update`
- **Lambda Function:** `userprofile_Update`

---


### Lambda Function
```python
import boto3
import json

dynamodb = boto3.resource('dynamodb')
cognito = boto3.client('cognito-idp')

# DynamoDB table name
TABLE_NAME = 'Avana'

# Cognito User Pool Id
USER_POOL_ID = 'us-west-2_rpX7WI1w2'

def lambda_handler(event, context):
    # Extract details from the event
    username = event['username']
    phone_number = event['phone_number']
    email = event['email']
    distributor_name = event['distributor_name']
    group_name = event['GroupName']
    name = event['name']
    nickname = event['nickname']
    user_id = event['UserId']
    timestamp = event['timestamp']
    category = event['category']
    profile = event['profile']
    msg = event['msg']
    team = event['team']
    assigner = event['assigner']
    assignername = event['assignername']
    
    # Update DynamoDB
    table = dynamodb.Table(TABLE_NAME)
    
    try:
        table.update_item(
            Key={
                'category': category,
                'timestamp': timestamp
            },
            UpdateExpression="""SET username = :username, 
                                    phone_number = :phone_number, 
                                    email = :email, 
                                    distributor_name = :distributor_name, 
                                    GroupName = :group_name, 
                                    #nm = :name, 
                                    nickname = :nickname, 
                                    UserId = :user_id, 
                                    profile = :profile, 
                                    msg = :msg, 
                                    team = :team, 
                                    assigner = :assigner, 
                                    assignername = :assignername""",
            ExpressionAttributeValues={
                ':username': username,
                ':phone_number': phone_number,
                ':email': email,
                ':distributor_name': distributor_name,
                ':group_name': group_name,
                ':name': name,
                ':nickname': nickname,
                ':user_id': user_id,
                ':profile': profile,
                ':msg': msg,
                ':team': team,
                ':assigner': assigner,
                ':assignername': assignername
            },
            ExpressionAttributeNames={
                '#nm': 'name'
            }
        )
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps('Error updating DynamoDB: ' + str(e))
        }

    # Update Cognito
    try:
        response = cognito.admin_update_user_attributes(
            UserPoolId=USER_POOL_ID,
            Username=username,
            UserAttributes=[
                {'Name': 'phone_number', 'Value': phone_number},
                {'Name': 'email', 'Value': email},
                {'Name': 'name', 'Value': name},
                {'Name': 'nickname', 'Value': nickname},
                {'Name': 'custom:distributor_name', 'Value': ','.join(distributor_name)},
                {'Name': 'profile', 'Value': profile},
            ]
        )
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps('Error updating Cognito: ' + str(e))
        }
    
    return {
        'statusCode': 200,
        'body': json.dumps('User profile updated successfully')
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
            "Resource": [
                "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Avana"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:AdminUpdateUserAttributes"
            ],
            "Resource": [
                "arn:aws:cognito-idp:REGION:ACCOUNT_ID:userpool/us-west-2_rpX7WI1w2"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": [
                "arn:aws:logs:REGION:ACCOUNT_ID:log-group:/aws/lambda/YOUR_LAMBDA_NAME:*"
            ]
        }
    ]
}

```
---


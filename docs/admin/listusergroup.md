# LIST OF USER GROUP

### API Overview
- **Resource Name:** `list_user_group`
- **Sub Resource Name:** `Avana_List_users_in_group`
- **Method:** `GET`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/list_user_group`
- **Lambda Function:** ``

---


### Lambda Function
```python
import json
import boto3
def lambda_handler(event, context):
    client = boto3.client('cognito-idp')
    
    # List users in group
    response = client.list_users_in_group(
    UserPoolId='us-west-2_rpX7WI1w2',
    GroupName=event["GroupName"],
    Limit=60
    )
    
    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps(response, default=str)
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
                "cognito-idp:ListUsersInGroup"
            ],
            "Resource": "arn:aws:cognito-idp:us-west-2:<account-id>:userpool/us-west-2_rpX7WI1w2"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-west-2:<account-id>:log-group:/aws/lambda/*"
        }
    ]
}


```
---

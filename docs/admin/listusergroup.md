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

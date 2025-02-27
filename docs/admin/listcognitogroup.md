# List Cognito Group

### API Overview
- **Resource Name:** `List_Cognito_Group`
- **Sub Resource Name:** `List_Cognito_Group`
- **Method:** `GET`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/list_user_group`
- **Lambda Function:** ``

---


### Lambda Function
```python
import json
import boto3

def lambda_handler(event, context):
    # us-west-2_HJzPGkTmS
    USER_POOL_ID = 'us-west-2_rpX7WI1w2'
    client = boto3.client('cognito-idp')
    response = client.list_groups(
    UserPoolId=USER_POOL_ID
    )
    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps(response, default=str)
    }
    # return response

```

---

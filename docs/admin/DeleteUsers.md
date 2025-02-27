# Delete Users

## Overview
- **Resource Name**: `deleteuserss`
- **Method**: `DELETE`
- **Invoke URL**:`https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/deleteuserss`
- **Lambda Function**: `deleteuserss`

---

### Lambda Function Code:
```python
import boto3
import json

def delete_cognito_users(user_pool_id, event):
    client = boto3.client('cognito-idp')
    usernames = event['usernames']  # Assumes the input is provided as the username

    for username in usernames:
        try:
            cognitoresponse = client.admin_delete_user(
                UserPoolId=user_pool_id,
                Username=username
            )
            print(f"User '{username}' deleted successfully.")
        except Exception as e:
            print(f"Failed to delete user '{username}': {str(e)}")

def delete_dynamodb_users(event):            
    dynamodb = boto3.client('dynamodb')            
    table_name = 'Avana'

    items_to_delete = event["deleteitems"]

    for item in items_to_delete:
        partition_key = item['category']
        sort_key = item['timestamp']

        # Delete the item from the table
        dynamodbresponse = dynamodb.delete_item(
            TableName=table_name,
            Key={
                'category': {'S': partition_key},
                'timestamp': {'S': sort_key}
            }
        )
        # Print the response for debugging (optional)
        print(dynamodbresponse)

def lambda_handler(event, context):
    user_pool_id = 'us-west-2_rpX7WI1w2'

    delete_dynamodb_users(event)
    delete_cognito_users(user_pool_id, event)

    return {
        'statusCode': 200,
        'body': 'Cognito users deleted successfully'
    }
```

---

### Notes:
- Ensure the `user_pool_id` is correct and your Lambda function has the necessary permissions to delete users from Cognito and DynamoDB.
- Use proper IAM policies to avoid security issues.
- Log responses for better debugging and visibility.


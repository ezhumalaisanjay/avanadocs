# Get Internal User

### API Overview
- **Resource Name:** `get_all_internal_user`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/get_all_internal_user`
- **Lambda Function:** `Avana_gat_all_internal_user`

---


### Lambda Function
```python
import json
import boto3

def lambda_handler(event, context):
    # Initialize DynamoDB client
    dynamodb = boto3.client('dynamodb')

    # Define category and profile values (you can pass these as input to the Lambda function)
    category = event.get('category', 'DefaultCategory')
    profile = event.get('profile', 'DefaultProfile')

    # Scan the DynamoDB table for users with the specified category and profile
    try:
        response = dynamodb.scan(
            TableName='Avana',
            FilterExpression="#category = :category and #profile = :profile",
            ExpressionAttributeNames={
                "#category": "category",
                "#profile": "profile"
            },
            ExpressionAttributeValues={
                ":category": {"S": category},
                ":profile": {"S": profile}
            }
        )

        # Extract user data from the response and format it without {"S": ...}
        users = response.get('Items', [])
        users_list = []
        for user in users:
            user_dict = {}
            for key, value in user.items():
                user_dict[key] = list(value.values())[0]
            users_list.append(user_dict)

        return {
            'statusCode': 200,
            'body': json.dumps(users_list)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': str(e)
        }


```

---


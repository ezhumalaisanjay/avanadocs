# Admin View User

## Overview 
- **Resource Name**: `admin_view_user`
- **Method**: `GET`
- **Invoke URL** : [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/admin_view_user](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/admin_view_user) 
- **Lambda Function Name:** `Avana_get_all`
 
---

## Lambda Function
```python
import json
import boto3

def lambda_handler(event, context):
    # Initialize DynamoDB client
    dynamodb = boto3.client('dynamodb')

    # Define category and distributor_name values (you can pass these as input to the Lambda function)
    category = event.get('category', 'DefaultCategory')
    distributor_name = event.get('distributor_name', 'DefaultDistributor')

    # Query the DynamoDB table for users with the specified category and distributor_name in descending order
    try:
        response = dynamodb.query(
            TableName='Avana',
            KeyConditionExpression="#category = :category",
            FilterExpression="#distributor_name = :distributor_name",
            ExpressionAttributeNames={
                "#category": "category",
                "#distributor_name": "distributor_name"
            },
            ExpressionAttributeValues={
                ":category": {"S": category},
                ":distributor_name": {"S": distributor_name}
            },
            ScanIndexForward=False  # Set to False for descending order
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

## Notes
- Ensure the `category` and `distributor_name` values exist in the DynamoDB table before calling the API.
- The Lambda function requires IAM permissions to query the DynamoDB table.
- Proper logging is recommended to monitor API performance.
- Results are sorted in descending order by default.


# Admin View User

## Overview 
- **API Name:** `Avana`  
- **Resource Name**: `admin_view_user`
- **Method**: `GET`
- **ARN:** `arn:aws:execute-api:us-west-2:600087091387:xqaizmksl2/*/GET/admin_view_user` 
- **API URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/admin_view_user`  
- **Resource ID:** `6xfemj`  
- **Lambda Function Name:** `Avana_get_all`
 

---

## Description
The `admin_view_user` API allows retrieving user data from the `Avana` DynamoDB table based on `category` and `distributor_name`. It queries the table and returns users in descending order.

---

## Lambda Function Implementation
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


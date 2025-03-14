# Get Deals Get

### API Overview
- **Resource Name:** `get_deals`
- **Method:** `GET`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/get_deals`
- **Lambda Function:** `avana_get_deals`

---


### Lambda Function
```python
import json
import boto3
import logging

# Initialize a DynamoDB client
dynamodb = boto3.client('dynamodb')
table_name = 'Avana'

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        # Extract the desired category and UserId from the input event
        category = event.get("category")
        userid = event.get("UserId")

        logger.info(f"Received event: {event}")

        # Check if user_id is missing or not a string
        if userid is None or not isinstance(userid, str):
            error_message = "Invalid or missing 'userId' in the input event."
            logger.error(error_message)
            response = {
                "statusCode": 400,
                "body": json.dumps(error_message)
            }
            return response

        # Perform a query operation to retrieve data from the DynamoDB table based on the category and UserId
        response = dynamodb.query(
            TableName=table_name,
            KeyConditionExpression="category = :cat",
            FilterExpression="UserId = :uid",
            ExpressionAttributeValues={
                ":cat": {"S": category},
                ":uid": {"S": userid}
            },
            ConsistentRead=True  # Strongly consistent read
        )

        logger.info(f"DynamoDB Query Response: {response}")

        # Extract the items from the response
        items = response.get("Items", [])

        # Convert the items to a list of dictionaries
        data = [dict((k, v.get('S', v.get('N'))) for k, v in item.items()) for item in items]

        # Check if data is empty and return an appropriate response
        if not data:
            error_message = "No data found for the given criteria."
            logger.warn(error_message)
            response = {
                "statusCode": 404,
                "body": json.dumps(error_message)
            }
            return response

        # Return the retrieved data in the response
        response = {
            "statusCode": 200,
            "body": json.dumps(data)
        }
    except Exception as e:
        error_message = f"Error retrieving data from Avana table: {str(e)}"
        logger.error(error_message)
        response = {
            "statusCode": 500,
            "body": json.dumps(error_message)
        }

    return response


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
                "dynamodb:Query",
                "dynamodb:GetItem"
            ],
            "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/Avana"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-east-1:123456789012:log-group:/aws/lambda/YourLambdaFunction:*"
        }
    ]
}


```
---


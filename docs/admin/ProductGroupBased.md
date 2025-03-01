# Product Group Based Data

## API Overview

- **Resource Name:** `Productgroupbased_dataget`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Productgroupbased_dataget`
- **Lambda Function:** `Productgroupbased_dataget`



## **Lambda Function**

```python
import boto3
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        distributor_name = event.get('distributor_name', '')
        product_group = event.get('product_group', '')
        category = event.get('category', '')

        # Create DynamoDB client
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('Avana')  # Replace 'Avana' with your actual table name

        # Initialize a list to store the response data
        response_data = []

        # Query DynamoDB based on distributor_name, product_group, and category
        scan_params = {
            "FilterExpression": "#dn = :distributor_name AND #pg = :product_group AND #cat = :category",
            "ExpressionAttributeNames": {
                "#dn": "distributor_name",
                "#pg": "product_group",
                "#cat": "category"
            },
            "ExpressionAttributeValues": {
                ":distributor_name": distributor_name,
                ":product_group": product_group,
                ":category": category
            }
        }

        # Perform the scan operation
        response = table.scan(**scan_params)

        # Process the response and add records to response_data
        response_data.extend(response.get('Items', []))

        logger.info("Lambda executed successfully")
        return {
            "statusCode": 200,
            "body": response_data
        }
    
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return {
            "statusCode": 500,
            "body": f"Internal Server Error: {str(e)}"
        }
```
---

## **IAM Policy for Lambda Execution Role**

Attach this policy to the Lambda execution role to allow access to DynamoDB and CloudWatch.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:Scan",
                "dynamodb:Query",
                "dynamodb:GetItem"
            ],
            "Resource": "arn:aws:dynamodb:us-west-2:YOUR_AWS_ACCOUNT_ID:table/Avana"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-west-2:YOUR_AWS_ACCOUNT_ID:*"
        }
    ]
}
```

Replace `YOUR_AWS_ACCOUNT_ID` with your actual AWS account ID.

---

# API Documentation: Work - New Work

## Overview

This API allows users to submit new work records to a DynamoDB table. It is implemented using AWS Lambda and API Gateway.

### **Resource Details**

- **Resource Name:** `work`
- **Sub Resource Name:** `new_work`
- **Method:** `POST`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/work/new_work`
- **Lambda Function:** `Avana_New_Work_Report`
- **Database:** `DynamoDB (Table: Avana)`

---

## **Lambda Function Code**

```python
import boto3
import json
import logging
from datetime import datetime

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Avana")

def lambda_handler(event, context):
    try:
        # Add timestamp
        event["timestamp"] = datetime.utcnow().isoformat(timespec='microseconds')
        
        # Insert item into DynamoDB
        table.put_item(Item=event)
        
        logger.info(f"Successfully inserted item: {event}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                "message": "Item inserted successfully",
                "data": event
            }, default=str)
        }
    except Exception as e:
        logger.error(f"Error inserting item: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                "message": "Internal Server Error",
                "error": str(e)
            })
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
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:GetItem",
                "dynamodb:Scan",
                "dynamodb:Query"
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

## **Conclusion**

This API allows users to create work records in the `Avana` DynamoDB table. The Lambda function handles inserting data and logging errors. API Gateway provides secure access, and proper IAM policies ensure restricted access.

Would you like additional security features, such as authentication via AWS Cognito? 🚀

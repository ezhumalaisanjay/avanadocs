# Sales Tracking - Update New Attribute

:::note
This documentation provides details about the `sales_tracking` API and its sub-API `Avana_update_new_attribute`, which updates the `sales_order_status` attribute in the **Avana** DynamoDB table.
:::

## Overview

**API Name:** sales_tracking  
**Sub API Name:** Avana_update_new_attribute  
**Method:** PUT  
**Lambda Function Name:** Avana_update_new_attribute  
**Invoke URL:** https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking/Avana_update_new_attribute

## Lambda Function

```python
import boto3
from datetime import datetime

def lambda_handler(event, context):
    # Define the DynamoDB table name
    table_name = 'Avana'

    # Initialize the DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)

    # Iterate through each item in the event
    for item in event:
        # Extract timestamp and convert it to a DynamoDB compatible format
        timestamp = datetime.strptime(item['timestamp'], '%Y-%m-%dT%H:%M:%S.%f').isoformat()

        # Update the item in the DynamoDB table
        response = table.update_item(
            Key={
                'category': item['category'],
                'timestamp': timestamp
            },
            UpdateExpression='SET sales_order_status = :val',  # Change 'cart' to 'sales_order_status'
            ExpressionAttributeValues={
                ':val': item['sales_order_status']  # Change 'cart' to 'sales_order_status'
            }
        )

    return {
        'statusCode': 200,
        'body': 'sales order status attribute updated successfully.'
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
                "dynamodb:UpdateItem"
            ],
            "Resource": [
                "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Avana"
            ]
        }
    ]
}


```
---
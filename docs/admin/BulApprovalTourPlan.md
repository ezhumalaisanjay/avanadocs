# Bulk Approval Tour Plan

## Overview
- **API Name**: approval_tour_plan_bulk_approval
- **Method**: PUT
- **Resource ID**: dll14b
- **ARN**: `arn:aws:execute-api:us-west-2:600087091387:xqaizmksl2/*/PUT/approval/tour_plan/bulk_approval`
- **API URL**: [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/approval/tour_plan/bulk_approval](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/approval/tour_plan/bulk_approval)
- **Lambda Function Name**: `bulck_approval`
- **DynamoDB Table**: `Avana`

## Description
The **Bulk Approval Tour Plan API** updates multiple items in the **Avana** DynamoDB table in a single request. It updates the following attributes:
- **Approval_Status**
- **rejdates**
- **UserName**
- **rej**

## Lambda Function Implementation

```python
import boto3
import json

def lambda_handler(event, context):
    print(event)

    # Initialize the DynamoDB client
    client = boto3.client("dynamodb")

    # List of items to update
items_to_update = event.get('items', [])  # Get 'items' from the event or use an empty list if it doesn't exist

    # Initialize an empty response list
response_list = []

    for item in items_to_update:
        # Ensure that 'item' is a dictionary
        if not isinstance(item, dict):
continue  # Skip this item if it's not a dictionary

        # Construct the update expression and attribute values for each item
update_expression = "set #st=:newApproval_Status, #d=:newDates, #u=:newUserName, #r=:newRej"
expression_attribute_names = {
            "#st": "Approval_Status",
            "#d": "rejdates",
            "#u": "UserName",
            "#r": "rej"
        }
expression_attribute_values = {
':newApproval_Status': {'S': item.get('Approval_Status', '')},  
':newDates': {'S': item.get('rejdates', '')},  
':newUserName': {'S': item.get('UserName', '')},  
':newRej': {'S': item.get('rej', '')}  
        }

        # Update the item in the DynamoDB table
        response = client.update_item(
TableName="Avana",  
            Key={
                'category': {'S': item.get('category', '')},  
                'timestamp': {'S': item.get('timestamp', '')}  
            },
UpdateExpression=update_expression,
ExpressionAttributeNames=expression_attribute_names,
ExpressionAttributeValues=expression_attribute_values,
ReturnValues="ALL_NEW"
        )

response_list.append(response)

    return {
        'statusCode': 200,
        'body': json.dumps(response_list, default=str)
    }

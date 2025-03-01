# Bulk Approval Tour Plan

## Overview
- **Resource Name**: approval
- **Sub Resource**: tour_plan
- **Sub Resource Name**: bulk_approval
- **Method**: PUT
- **Invoke URL**: [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/approval/tour_plan/bulk_approval](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/approval/tour_plan/bulk_approval)
- **Lambda Function Name**: `bulck_approval`
---

## Lambda Function Implementation

```python
import boto3
import json

def lambda_handler(event, context):
    # TODO implement
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
            ':newApproval_Status': {'S': item.get('Approval_Status', '')},  # Use the appropriate DynamoDB type (S for String in this case)
            ':newDates': {'S': item.get('rejdates', '')},  # Use the appropriate DynamoDB type
            ':newUserName': {'S': item.get('UserName', '')},  # Use the appropriate DynamoDB type
            ':newRej': {'S': item.get('rej', '')}  # Use the appropriate DynamoDB type
        }
        
        # Update the item in the DynamoDB table
        response = client.update_item(
            TableName="Avana",  # Replace with your table name
            Key={
                'category': {'S': item.get('category', '')},  # Use the appropriate DynamoDB type for the key
                'timestamp': {'S': item.get('timestamp', '')}  # Use the appropriate DynamoDB type for the key
            },
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"  # You can change this based on your requirements
        )
        
        response_list.append(response)
    
    return {
        'statusCode': 200,
        'body': json.dumps(response_list, default=str)
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
        "arn:aws:dynamodb:us-west-2:YOUR_ACCOUNT_ID:table/Avana"
      ]
    }
  ]
}



```
---
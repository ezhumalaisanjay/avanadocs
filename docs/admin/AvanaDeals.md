# Avana Deals

## Overview
- **API Name**: avana_deals
- **Method**: POST
- **Resource ID**: gm89sd
- **ARN**: `arn:aws:execute-api:us-west-2:600087091387:xqaizmksl2/*/POST/avana_deals`
- **API URL**: [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test)
- **Lambda Function Name**: `avana_deals_lambda`
- **DynamoDB Table**: `Avana`

## Description
The **Avana Deals API** allows users to insert deal-related data into the **Avana** DynamoDB table.  
A timestamp is automatically added to each record before it is stored.

## Lambda Function Implementation

```python
import json
import boto3
from datetime import datetime

def lambda_handler(event, context):
dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
    table = dynamodb.Table('Avana')

    # Ensure event is a dictionary
    if isinstance(event, dict):
        # Add a timestamp to the event
        event["timestamp"] = datetime.now().isoformat(timespec='microseconds')

        # Insert the modified event into DynamoDB
table.put_item(Item=event)

        return {
            'statusCode': 200,
            'body': json.dumps('Deals updated!')
        }
    else:
        return {
            'statusCode': 400,
            'body': json.dumps('Invalid event format')
        }

# Avana Deals

## Overview
- **Resource Name**: avana_deals
- **Method**: POST
- **Invoke URL**: [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test)
- **Lambda Function Name**: `avana_Deals`
---

## Lambda Function

```python
import json
import boto3
from datetime import datetime,timezone
from boto3.dynamodb.conditions import Key
from boto3.dynamodb.conditions import Attr
from dateutil.tz import tzlocal

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

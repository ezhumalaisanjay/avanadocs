# Sales Tracking - Create Sales Order

:::note
This documentation provides details about the `sales_tracking` API and its sub-API `/create_sales_order`, which creates a sales order using Zoho Inventory.
:::

## Overview

**API Name:** sales_tracking  
**Sub API Name:** /create_sales_order  
**Method:** POST  
**Lambda Function Name:** Avana_Create_sales_order_invntory  
**Invoke URL:** https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking/create_sales_order

## Lambda Function

```python
import requests
import json
import boto3

dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    category = "access_token_inventory"  # Replace with the desired category
    timestamp = "2023-10-22T12:00:05.955636"  # Replace with the desired timestamp
    
    response = dynamodb.query(
        TableName='Avana',
        KeyConditionExpression='#category = :category AND #timestamp = :timestamp',
        ExpressionAttributeNames={'#category': 'category', '#timestamp': 'timestamp'},
        ExpressionAttributeValues={':category': {'S': category}, ':timestamp': {'S': timestamp}}
    )
    
    items = response.get('Items', [])
    access_token = items[0]["access_tokens"]["S"]
    print("Access Token:", access_token)
    
    # Proceed with the API request using the access_token
    url = "https://www.zohoapis.in/inventory/v1/salesorders?organization_id=60015333937"

    payload = json.dumps(event)
    headers = {
        'Authorization': 'Zoho-oauthtoken ' + access_token
    }
    
    responses = requests.request("POST", url, headers=headers, data=payload)
    
    print(responses.text)
    
    # Extract relevant information for JSON serialization
    response_data = {
        'status_code': responses.status_code,
        'headers': dict(responses.headers),
        'text': responses.text
    }
   
    return {
        'statusCode': 200,
        'body': json.dumps(response_data)
    }
```

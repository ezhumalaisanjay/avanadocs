# Create Sales Records in Zoho CRM

## Overview
- **API Name**: Create_records_custom_module_zoho_crm
- **Method**: POST
- **Resource ID**: zxm5eo
- **ARN**: `arn:aws:execute-api:us-west-2:600087091387:xqaizmksl2/*/POST/crm/Create_records_sales_module_zoho_crm`
- **API URL**: [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/crm/Create_records_sales_module_zoho_crm](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/crm/Create_records_sales_module_zoho_crm)
- **Lambda Function Name**: `Create_records_sales_module_zoho_crm`
- **DynamoDB Table**: `Avana`
- **Zoho CRM API Endpoint**: `https://www.zohoapis.in/crm/v5/Sales_Report`

## Description
This API:
1. **Retrieves an access token** from the `Avana` DynamoDB table.
2. **Sends a request** to create a record in the Zoho CRM custom module (`Application_Report`).
3. **Returns the Zoho CRM response** with the status code and headers.

## Lambda Function

```python
import requests
import json
import boto3

dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    
    category = "access_token"  # Replace with the desired category
    timestamp = "2023-10-21T12:00:05.955395"  # Replace with the desired timestamp
    
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
    urlss = "https://www.zohoapis.in/crm/v5/Sales_Report"

    payloads = json.dumps(event)
    headerss = {
        'Authorization': 'Zoho-oauthtoken ' + access_token,
        'Content-Type': 'application/json'
    }
    
    responses = requests.request("POST", urlss, headers=headerss, data=payloads)
    
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
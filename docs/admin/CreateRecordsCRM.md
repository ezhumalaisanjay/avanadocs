# Create Custom Records in Zoho CRM

## Overview
- **API Name**: Create_records_custom_module_zoho_crm
- **Method**: POST
- **Resource ID**: 9o2xjg
- **ARN**: `arn:aws:execute-api:us-west-2:600087091387:xqaizmksl2/*/POST/Create_records_custom_module_zoho_crm`
- **API URL**: [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Create_records_custom_module_zoho_crm](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Create_records_custom_module_zoho_crm)
- **Lambda Function Name**: `create_zoho_crm_record`
- **DynamoDB Table**: `Avana`
- **Zoho CRM API Endpoint**: `https://www.zohoapis.in/crm/v5/Application_Report`

## Description
This API:
1. **Retrieves an access token** from the `Avana` DynamoDB table.
2. **Sends a request** to create a record in the Zoho CRM custom module (`Application_Report`).
3. **Returns the Zoho CRM response** with the status code and headers.

## Lambda Function Implementation

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

    if not items:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'No access token found in DynamoDB'})
        }

access_token = items[0]["access_tokens"]["S"]
print("Access Token:", access_token)

    # Zoho CRM API Endpoint
urlss = "https://www.zohoapis.in/crm/v5/Application_Report"

    payloads = json.dumps(event)
headerss = {
        'Authorization': 'Zoho-oauthtoken ' + access_token,
        'Content-Type': 'application/json'
    }

    responses = requests.request("POST", urlss, headers=headerss, data=payloads)

    print(responses.text)

    # Extract relevant response data
response_data = {
        'status_code': responses.status_code,
        'headers': dict(responses.headers),
        'text': responses.text
    }

    return {
        'statusCode': 200,
        'body': json.dumps(response_data)
    }

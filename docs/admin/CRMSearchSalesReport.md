# Search & Delete Sales Order Reports in Zoho CRM

## Overview
This AWS Lambda function:
1. **Fetches an OAuth access token** from the **DynamoDB table (`Avana`)**.
2. **Retrieves sales order report records** from Zoho CRM based on the **salesorder_number**.
3. **Deletes the retrieved records** from Zoho CRM.

## API Gateway Endpoint
- **Method**: `PUT`
- **Invoke URL**:  
https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/crm/Search_sales_report_zoho_crm
- **ARN**:  
arn:aws:execute-api:us-west-2:600087091387:xqaizmksl2/*/PUT/crm/Search_sales_report_zoho_crm
- **Resource ID**: `dwbqgj`

## Environment Setup
Ensure the following AWS resources are available:
- **DynamoDB Table**: `Avana`
- **Partition Key**: `category` (String)
- **Sort Key**: `timestamp` (String)
- **Access Token Attribute**: `access_tokens`

## Lambda Function Code
```python
import requests
import json
import boto3

dynamodb = boto3.client('dynamodb')

def delete_records(access_token, all_records_ids):
  """Delete sales order report records from Zoho CRM."""
url = "https://www.zohoapis.in/crm/v6/Sales_Order_Report"
  params = {
      "ids": ",".join(all_records_ids),
      "wf_trigger": "true"
  }
  headers = {
      'Authorization': 'Zoho-oauthtoken ' + access_token
  }
  response = requests.delete(url, params=params, headers=headers)
  return response.text

def fetch_records(access_token, salesorder_number, page):
  """Fetch sales order report records from Zoho CRM."""
url = f"https://www.zohoapis.in/crm/v5/Sales_Order_Report/search"
  params = {
      "criteria": f"salesorder_number:equals:{salesorder_number}",
      "per_page": 200,
      "page": page,
      "fields": "id"
  }
  headers = {
      'Authorization': 'Zoho-oauthtoken ' + access_token
  }
  response = requests.get(url, headers=headers, params=params)
  return response.json()

def lambda_handler(event, context):
  """Lambda function entry point."""
  category = "access_token"
  timestamp = "2023-10-21T12:00:05.955395"

  # Fetch access token from DynamoDB
  response = dynamodb.query(
TableName='Avana',
KeyConditionExpression='#category = :category AND #timestamp = :timestamp',
ExpressionAttributeNames={'#category': 'category', '#timestamp': 'timestamp'},
ExpressionAttributeValues={':category': {'S': category}, ':timestamp': {'S': timestamp}}
  )
  items = response.get('Items', [])
access_token = items[0]["access_tokens"]["S"]
print("Access Token:", access_token)

salesorder_numbers = event["salesorder_number"]
all_records_ids = []

  # Iterate through each sales order number
  for number in salesorder_numbers:
      page = 1
      while True:
          records = fetch_records(access_token, number, page)
record_ids = [record['id'] for record in records.get("data", [])]
all_records_ids.extend(record_ids)
          if not records.get("info", {}).get("more_records"):
              break
          page += 1

  # Delete fetched records
  print(all_records_ids)
deleteresponse = delete_records(access_token, all_records_ids)
  print(deleteresponse)

  return {
      'statusCode': 200,
      'body': json.dumps(deleteresponse)
  }

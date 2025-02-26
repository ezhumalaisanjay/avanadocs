# Search Contacts in Zoho CRM

## Overview
This AWS Lambda function retrieves an **OAuth access token** from a **DynamoDB table (`Avana`)** and uses it to **fetch contact records** from the **Zoho CRM Contacts module** based on a **Distributor Name**.

## API Gateway Endpoint
- **Method**: `GET`
- **URL**: [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/crm/search_contacts](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/crm/search_contacts)
- **ARN**:  `arn:aws:execute-api:us-west-2:600087091387:xqaizmksl2/*/GET/crm/search_contacts`
- **Resource ID**: `knw0ki`

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

def get_latest_access_token():
  """Fetch the most recent access token from DynamoDB."""
  try:
      response = dynamodb.query(
TableName='Avana',
KeyConditionExpression='#category = :category',
ExpressionAttributeNames={'#category': 'category'},
ExpressionAttributeValues={':category': {'S': 'access_token'}},
ScanIndexForward=False,  # Sorts in descending order (latest first)
          Limit=1  # Fetch the most recent item
      )

      items = response.get('Items', [])
      if not items:
          raise Exception("No access token found in DynamoDB.")

      return items[0]["access_tokens"]["S"]

  except Exception as e:
print(f"Error fetching access token: {e}")
      return None

def fetch_records(access_token, distributor_name, page):
  """Fetch contact records from Zoho CRM based on distributor name."""
url = "https://www.zohoapis.in/crm/v5/Contacts/search"
  params = {
      "criteria": f"Distributor_Name:equals:{distributor_name}",
      "per_page": 200,
      "page": page,
      "fields": "Full_Name"
  }
  headers = {
      'Authorization': f'Zoho-oauthtoken {access_token}'
  }
  response = requests.get(url, headers=headers, params=params)
  return response.json()

def lambda_handler(event, context):
access_token = get_latest_access_token()
  if not access_token:
      return {
          'statusCode': 500,
          'body': json.dumps({'error': 'Access token retrieval failed'})
      }

distributor_name = event.get("Distributor_Name")
  if not distributor_name:
      return {
          'statusCode': 400,
          'body': json.dumps({'error': 'Distributor_Name parameter is required'})
      }

all_records = []

  # Fetch first 200 records
first_page_records = fetch_records(access_token, distributor_name, 1)
all_records.extend(first_page_records.get("data", []))

  # Fetch next 200 records if available
  if first_page_records.get("info", {}).get("more_records"):
second_page_records = fetch_records(access_token, distributor_name, 2)
all_records.extend(second_page_records.get("data", []))

  return {
      'statusCode': 200,
      'body': json.dumps({'records': all_records})
  }

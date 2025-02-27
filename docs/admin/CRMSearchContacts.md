# Search Contacts in Zoho CRM

## Overview
- **Method**: `GET`
- **Invoke URL**: [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/crm/search_contacts](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/crm/search_contacts)
- **Resource**: `crm`
- **Sub Resource**: `search_contacts`

---

## Lambda Function Code
```python
import requests
import json
import boto3

dynamodb = boto3.client('dynamodb')

def fetch_records(access_token, distributor_name, page):
    url = f"https://www.zohoapis.in/crm/v5/Contacts/search"
    params = {
        "criteria": f"Distributor_Name:equals:{distributor_name}",
        "per_page": 200,
        "page": page,
        "fields": "Full_Name"
    }
    headers = {
        'Authorization': 'Zoho-oauthtoken ' + access_token
    }
    response = requests.get(url, headers=headers, params=params)
    return response.json()

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
    
    distributor_name = event["Distributor_Name"]
    
    all_records = []
    
    # Fetch first 200 records
    first_page_records = fetch_records(access_token, distributor_name, 1)
    all_records.extend(first_page_records.get("data", []))
    
    # Fetch next 200 records if available
    if first_page_records.get("info", {}).get("more_records"):
        second_page_records = fetch_records(access_token, distributor_name, 2)
        all_records.extend(second_page_records.get("data", []))
    
    # Extract relevant information for JSON serialization
    response_data = {
        'records': all_records
    }
   
    return {
        'statusCode': 200,
        'body': json.dumps(response_data)
    }


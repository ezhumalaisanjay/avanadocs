# Search & Delete Sales Order Reports in Zoho CRM

## Overview
- **Method**: `PUT`
- **Invoke URL**:  
https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/crm/Search_sales_report_zoho_crm
- **Resource**: `crm`
- **Sub Resource**: `Search_sales_report_zoho_crm`

---

## Lambda Function Code
```python
import requests
import json
import boto3

dynamodb = boto3.client('dynamodb')

def delete_records(access_token, all_records_ids):
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
    url = f"https://www.zohoapis.in/crm/v5/Sales_Order_Report/search"
    params = {
        "criteria": f"salesorder_number:equals:{salesorder_number}",
        "per_page": 200,
        "page": page,
        "fields": "id"  # Assuming you want to fetch the IDs
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
    
    salesorder_numbers = event["salesorder_number"]
    
    all_records_ids = []
    
    # Iterate through each sales order number
    for number in salesorder_numbers:
        # Fetch first 200 records for each sales order number
        page = 1
        while True:
            records = fetch_records(access_token, number, page)
            record_ids = [record['id'] for record in records.get("data", [])]
            all_records_ids.extend(record_ids)
            if not records.get("info", {}).get("more_records"):
                break
            page += 1
    
    # Prepare response data
    response_data = {
        'record_ids': all_records_ids
    }
    print(all_records_ids)
    deleteresponse = delete_records(access_token, all_records_ids)
    print(deleteresponse)
    
    return {
        'statusCode': 200,
        'body': json.dumps(deleteresponse)
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
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-west-2:YOUR_ACCOUNT_ID:table/Avana"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:us-west-2:YOUR_ACCOUNT_ID:log-group:/aws/lambda/YOUR_LAMBDA_FUNCTION_NAME:*"
      ]
    }
  ]
}






```
---

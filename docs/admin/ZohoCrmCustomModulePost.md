# Zoho Crm Custom Module Post

### API Overview
- **Resource Name:** `Zoho_CRM_custom_module_create_records`
- **Method:** `POST`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Zoho_CRM_custom_module_create_records`
- **Lambda Function:** `Zoho_CRM_custom_module_create_records`

---


### Lambda Function
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
    urlss = "https://www.zohoapis.in/crm/v5/Sales_Order_Report"
    print("Event:", event)
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

```

---


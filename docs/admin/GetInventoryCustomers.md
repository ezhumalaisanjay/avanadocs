# Get Inventory Customers

### API Overview
- **Resource Name:** `Get_inventory_customers`
- **Method:** `GET`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Get_inventory_customers`
- **Lambda Function:** `Get_inventory_customers`

---


### Lambda Function
```python
import requests
import json
import boto3
from concurrent.futures import ThreadPoolExecutor

dynamodb = boto3.client('dynamodb')

def fetch_page(access_token, page):
    url = f"https://www.zohoapis.in/inventory/v1/contacts?organization_id=60026284908&page={page}"
    
    headers = {
        'Authorization': 'Zoho-oauthtoken ' + access_token
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        print(f"Error: Unable to retrieve data (Status Code: {response.status_code})")
        return []
    
    data = response.json()
    
    # Project only the desired fields
    projected_records = [
        {'contact_id': contact.get('contact_id'), 'contact_name': contact.get('contact_name')}
        for contact in data.get('contacts', [])
    ]
    
    return projected_records

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
    
    # Initialize the list to store all records
    all_records = []
    
    # Estimate total pages (could be adjusted based on previous experience)
    total_pages = 15  # Adjust based on your needs
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(fetch_page, access_token, page) for page in range(1, total_pages + 1)]
        
        for future in futures:
            all_records.extend(future.result())
    
    actual_count = len(all_records)
    
    print(f"Total records retrieved: {actual_count}")
    
    # Extract relevant information for JSON serialization
    response_data = {
        'actual_count': actual_count,
        'records': all_records,  # Return only the projected fields
        'status_code': 200
    }
   
    return {
        'statusCode': 200,
        'body': json.dumps(response_data)
    }


```

---


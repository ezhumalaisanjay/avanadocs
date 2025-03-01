# Search Zoho Crm Module With Criteria

### API Overview
- **Resource Name:** `Search_zoho_crm_modules_with_criteria`
- **Method:** `POST`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Search_zoho_crm_modules_with_criteria`
- **Lambda Function:** `Search_zoho_crm_modules_with_criteria`

---


### Lambda Function
```python
import requests
import json
import boto3
from urllib.parse import quote

dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    
    category = "access_token"  # Replace with the desired category
    timestamp = "2024-05-11T12:00:05.952295"  # Replace with the desired timestamp
    
    response = dynamodb.query(
            TableName='Avana',
            KeyConditionExpression='#category = :category AND #timestamp = :timestamp',
            ExpressionAttributeNames={'#category': 'category', '#timestamp': 'timestamp'},
            ExpressionAttributeValues={':category': {'S': category}, ':timestamp': {'S': timestamp}}
    )
    items = response.get('Items', [])
    # access_token = "1000.f1f0bb407fa5d021cae2fbde6bc2b8d9.8226edc320035a30e8dd167d4ef5c87c"
    access_token = items[0]["access_tokens"]["S"]
    print("Access Token:", access_token)
    
    # Proceed with the API request using the access_token
    urlss = "https://www.zohoapis.in/crm/v6/coql"

    payloads = {"select_query": f"SELECT Full_Name FROM Contacts WHERE Distributor_Name = '{event['distributor_name']}' AND Full_Name like '{event['starts_with']}%' LIMIT 200"}
    # payloads = {"select_query": "SELECT Full_Name FROM Contacts WHERE Distributor_Name = 'B&J Healthcare Pvt Ltd' AND Full_Name Like 'D%' LIMIT 200"}

    headerss = {
        'Authorization': 'Zoho-oauthtoken ' + access_token,
        'Content-Type': 'application/json'
    }
    
    # responses = requests.request("POST", urlss, headers=headerss, data=payloads)
    responses = requests.post(urlss, headers=headerss, json=payloads)
    
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
                "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Avana"
            ]
        }
    ]
}

```
---


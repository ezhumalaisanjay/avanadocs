# Zoho Inventory taxes Avana

### API Overview
- **Resource Name:** `Zoho_inventory_taxes_avana`
- **Method:** `GET`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Zoho_inventory_taxes_avana`
- **Lambda Function:** `Zoho_inventory_taxes_avana`

---


### Lambda Function
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
    urlss = "https://www.zohoapis.in/inventory/v1/settings/" + event["taxtype"] + "?organization_id=60026284908"

    payloads = json.dumps(event)
    headerss = {
        'Authorization': 'Zoho-oauthtoken ' + access_token
    }
    
    responses = requests.request("GET", urlss, headers=headerss, data=payloads)
    
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


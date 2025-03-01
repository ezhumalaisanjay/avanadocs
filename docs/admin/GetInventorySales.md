# Get Inventory Sales

### API Overview
- **Resource Name:** `sales_tracking`
- **Sub Resource Name:** `get_inventory_sales`
- **Method:** `GET`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking/get_inventory_sales`
- **Lambda Function:** `Avana_get_inventory_customers`

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
    urlss = "https://www.zohoapis.in/inventory/v1/salesorders/"+event["salesorder_id"]+"?organization_id=60015333937"

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
            "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/Avana"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-east-1:123456789012:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Resource": "*"
        }
    ]
}


```
---


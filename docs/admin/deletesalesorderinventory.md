# Delete Sales Order Inventory

### API Overview
- **Resource Name:** `inventory`
- **Sub Resource Name:** `Delete_sales_order_zoho_inventory`
- **Method:** `DELETE`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/inventory/Delete_sales_order_zoho_inventory`
- **Lambda Function:** ``

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
    
    # Initialize an empty list to store response data for each sales order ID
    response_data_list = []
    
    for salesorder_id in event["salesorder_id"]:
        urlss = "https://www.zohoapis.in/inventory/v1/salesorders/"+ salesorder_id +"?organization_id=60026284908"
        
        payloads = json.dumps(event)
        headerss = {
            'Authorization': 'Zoho-oauthtoken ' + access_token
        }
        
        responses = requests.request("DELETE", urlss, headers=headerss, data=payloads)
        
        print("Sales Order ID:", salesorder_id)
        print("Response:", responses.text)
        
        # Extract relevant information for JSON serialization
        response_data = {
            'salesorder_id': salesorder_id,
            'status_code': responses.status_code,
            'headers': dict(responses.headers),
            'text': responses.text
        }
        
        # Append response data to the list
        response_data_list.append(response_data)
    
    return {
        'statusCode': 200,
        'body': json.dumps(response_data_list)
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
            "Resource": "arn:aws:dynamodb:YOUR_REGION:YOUR_ACCOUNT_ID:table/Avana"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:YOUR_REGION:YOUR_ACCOUNT_ID:*"
        }
    ]
}




```
---
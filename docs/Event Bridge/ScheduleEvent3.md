# Generate access token for Zoho inventory

**Schedule Name:**  
`Generate_access_token_inventory`

**Description:**  
Generate access token for zoho inventory

**Schedule Start Time:**  
Example: `Feb 28, 2025, 01:00:00 (UTC+05:30)`

**Schedule End Time:**  
Example: `Dec 31, 2025, 23:50:00 (UTC+05:30)`

---

## Schedule Configuration

**Type:**  
`Fixed rate`

**Rate:**  
`rate(40 minutes)`

---

## Target

**Service:**  
`AWS Lambda`

**API:**  
`Invoke`

**Target:**  
`Get_refresh_token_inventory`

**Target ARN:**  
`<Lambda function ARN>`

---

## Retry Policy

**Maximum Retention Time of Event:**  
`1 day`

**Maximum Retries:**  
`185 times`

---

## Lambda Function to Generate Zoho OAuth Token

```python
import requests
import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Avana')

def lambda_handler(event, context):
    url = "https://accounts.zoho.in/oauth/v2/token?refresh_token=1000.b4055cc4bf6841fdc79cdabf7debf246.ce6b1ceaebd16f5b9a1f7c94f7d3abde&client_id=1000.AE5GSW2SAXAEFYHQO8HFVX925F1N0W&client_secret=51ed25b3148f704a6dfefd4055b3dd9e6d9daa4e18&redirect_uri=https://www.google.co.in&grant_type=refresh_token"
    
    payload = {}
    headers = {
        'Cookie': '6e73717622=3bcf233c3836eb7934b6f3edc257f951; _zcsr_tmp=608b44b9-3a64-4d10-a1c2-3323e0dcd07f; iamcsr=608b44b9-3a64-4d10-a1c2-3323e0dcd07f'
    }
    
    response = requests.request("POST", url, headers=headers, data=payload)
    
    print(response.text)
    
    response_data = json.loads(response.text)
    
    # Check if 'access_token' is in the response_data
    if 'access_token' in response_data:
        access_token = response_data['access_token']
        print("Access Token:", access_token)
        
        category = "access_token_inventory"
        timestamp = "2023-10-22T12:00:05.955636"
        access_tokens = access_token
        
        # Update the record in DynamoDB
        response = table.update_item(
            Key={
                'category': category,
                'timestamp': timestamp
            },
            UpdateExpression='SET #statusAttr = :statusValue',
            ExpressionAttributeNames={
                '#statusAttr': 'access_tokens'
            },
            ExpressionAttributeValues={
                ':statusValue': access_tokens
            }
        )
        
        response_data = {
            'body': response
        }
       
    else:
        # Handle the case where 'access_token' is not present in the response
        response_data = {
            'error': 'Access Token not found in the response'
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
        "dynamodb:UpdateItem",
        "dynamodb:GetItem",
        "dynamodb:PutItem"
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
    },
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "*"
    }
  ]
}
```


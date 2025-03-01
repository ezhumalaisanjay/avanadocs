# Get Doctor

### API Overview
- **Resource Name:** `Doctor_Sale_gettable_recods`
- **Sub Resource** `Doctor_Record`
- **Method:** `PUT`
- **API URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Doctor_Sale_gettable_recods/Doctor_Record`
- **Lambda Function:** `Doctor_Record`

---


### Lambda Function
```python
import boto3

def lambda_handler(event, context):
    distributor_name = event.get('distributor_name', '')
    doctors_name = event.get('doctors_name', '')
    category = event.get('category', '')

    # Create DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'Avana' with your actual table name

    # Initialize a list to store the response data
    response_data = []

    # Query DynamoDB based on distributor_name, doctors_name, and category
    scan_params = {
        "FilterExpression": "distributor_name = :distributor_name AND doctorsname = :doctors_name AND category = :category",
        "ExpressionAttributeValues": {
            ":distributor_name": distributor_name,
            ":doctors_name": doctors_name,
            ":category": category
        }
    }

    # Perform the scan operation
    response = table.scan(**scan_params)

    # Process the response and add records to response_data
    response_data.extend(response.get('Items', []))

    return response_data
```


---

## IAM Policy for the Lambda Function

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "dynamodb:Scan",
            "Resource": "arn:aws:dynamodb:us-west-2:YOUR_AWS_ACCOUNT_ID:table/Avana"
        }
    ]
}




```
---

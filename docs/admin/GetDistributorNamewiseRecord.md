# Get Distributor Name Wise Record

### API Overview
- **Resource Name:** `Get_distributor_name_wise_record`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Get_distributor_name_wise_record`
- **Lambda Function:** `Get_distributor_name_wise_record`

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    # Extract values from the provided event
    category = event.get("category")
    distributor_name = event.get("distributor_name")
    tracking_status = event.get("tracking_status")

    # Create DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'YourDynamoDBTableName' with your actual table name

    # Query DynamoDB based on the provided criteria
    response = table.scan(
        FilterExpression=(
            "category = :category AND distributor_name = :distributor_name AND tracking_status = :tracking_status"
        ),
        ExpressionAttributeValues={
            ":category": category,
            ":distributor_name": distributor_name,
            ":tracking_status": tracking_status
        }
        
    )

    # Extract the matching record(s)
    matching_records = response.get('Items', [])

    # Sort the results in descending order based on the 'dates' field
    matching_records = sorted(matching_records, key=lambda x: x.get('dates', ''), reverse=True)

    # Print the matching records (you can modify this part based on your use case)
    print("Matching Records (Descending Order by Dates):")
    for record in matching_records:
        print(json.dumps(record, indent=2))

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Lambda function executed successfully!', 'matching_records': matching_records})
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
                "dynamodb:Scan"
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
        }
    ]
}

```
---

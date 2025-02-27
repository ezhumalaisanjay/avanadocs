# Distributor Namewise Detailed View

### API Overview
- **Resource Name:** `Distributor_name_wise_detailedview`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Get_distributor_name_wise_record/Distributor_name_wise_detailedview`
- **Lambda Function:** `Distributor_name_wise_record`

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    # Extract values from the provided event
    category = event.get("category")
    distributor_name = event.get("distributor_name")

    # Create DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'YourDynamoDBTableName' with your actual table name

    # Define key condition expression for category
    key_condition_expression = "category = :category"
    expression_attribute_values = {":category": category}

    # Define filter expression for distributor_name
    filter_expression = "distributor_name = :distributor_name"
    expression_attribute_values[":distributor_name"] = distributor_name

    # Query DynamoDB based on the provided criteria
    response = table.query(
        KeyConditionExpression=key_condition_expression,
        FilterExpression=filter_expression,
        ExpressionAttributeValues=expression_attribute_values
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


# Admin Delete Records 

## Overview 
- **API Name**: Avana
- **Resource Name:** Admin_delete_records
- **API URL:** [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Admin\_delete\_records](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Admin_delete_records)\
- **Lambda Function Name:** Admin_delete_records
- **Method**: Delete

---

## Description

The `Admin_delete_records` API allows deleting specific records from the DynamoDB table **Avana**. It processes a list of records received in the event payload and deletes them based on the `category` and `timestamp` attributes.

---


## Lambda Function

```python
import boto3

# Specify the DynamoDB table name
table_name = 'Avana'

def lambda_handler(event, context):
    # Retrieve the list of records from the event
    records = event

    # Initialize the DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)

    try:
        # Iterate through the list of records and delete each item from DynamoDB
        for record in records:
            category = record.get('category')
            timestamp = record.get('timestamp')

            response = table.delete_item(
                Key={
                    'category': category,
                    'timestamp': timestamp
                }
            )

            # Print the response for logging purposes
            print("DeleteItem succeeded for category={}, timestamp={}".format(category, timestamp))

        return {
            'statusCode': 200,
            'body': 'Records deleted'
        }

    except Exception as e:
        # Handle any errors that may occur during the delete operation
        print("Error deleting items:", str(e))
        return {
            'statusCode': 500,
            'body': 'Error deleting items'
        }
```

---

## Error Handling

- If any error occurs during deletion, the function logs the error message and returns a `500 Internal Server Error` response.
- If the required keys (`category`, `timestamp`) are missing, the function may fail with a validation error.

---

## Usage

This API can be invoked using AWS Lambda, API Gateway, or directly through an AWS SDK or HTTP client.

Example request using `curl`:

```sh
curl -X POST "https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Admin_delete_records" \
     -H "Content-Type: application/json" \
     -d '[{"category": "example_category", "timestamp": "2024-02-25T12:34:56Z"}]'
```

---

## Notes

- Ensure the `category` and `timestamp` values exist in the DynamoDB table before calling the API.
- The Lambda function requires the necessary IAM permissions to delete items from the DynamoDB table.
- Proper logging is recommended to monitor delete operations.

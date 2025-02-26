# Admin Delete Records 

## Overview 
- **Resource Name:** Admin_delete_records
- **Invoke URL:** [https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Admin\_delete\_records](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Admin_delete_records)\
- **Lambda Function Name:** Admin_delete_records
- **Method**: Delete

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

## Notes

- Ensure the `category` and `timestamp` values exist in the DynamoDB table before calling the API.
- The Lambda function requires the necessary IAM permissions to delete items from the DynamoDB table.
- Proper logging is recommended to monitor delete operations.

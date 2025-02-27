# Delete Multiple Records

## Overview
- **Resource Name** : `delete_multiple_records`
- **Method** : `DELETE`
- **API URL** : `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/delete_multiple_records`
- **Lambda Function Name** : `Avana_delete_records`

---

## Lambda Function
```python
import boto3

def lambda_handler(event, context):
    # Initialize the DynamoDB client
    dynamodb = boto3.client('dynamodb')

    # Specify the table name
    table_name = 'Avana'

    # Check if the "items" key exists in the event payload
    if "items" in event:
        items_to_delete = event["items"]

        for item in items_to_delete:
            # Extract partition key (category) and sort key (timestamp) values to delete
            partition_key_value = item["category"]
            sort_key_value = item["timestamp"]

            # Delete the item from the table
            try:
                response = dynamodb.delete_item(
                    TableName=table_name,
                    Key={
                        'category': {'S': partition_key_value},
                        'timestamp': {'S': sort_key_value}
                    }
                )
                print(f"Item deleted successfully: {partition_key_value} - {sort_key_value}")
            except Exception as e:
                print(f"Error deleting item: {e}")

        return {
            'statusCode': 200,
            'body': 'Items deleted successfully'
        }
    else:
        return {
            'statusCode': 400,
            'body': 'Missing "items" key in the event payload'
        }
```

---

## Notes
- The `category` is the partition key and `timestamp` is the sort key of the `Avana` DynamoDB table.
- Items are identified by the unique combination of `category` and `timestamp`.
- Make sure the request body is in proper JSON format.
- Errors will be logged in CloudWatch if deletion fails.


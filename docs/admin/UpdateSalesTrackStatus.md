# Update Sales Track Status

### API Overview
- **Resource Name:** `sales_tracking`
- **Sub Resource Name:** `update_sales_track_status`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking/update_sales_track_status`
- **Lambda Function:** `Update_sales_track_status`

---


### Lambda Function
```python
import json
import boto3

def lambda_handler(event, context):
    # Check if the required parameters are present in the incoming event
    if 'category' not in event or 'timestamp' not in event or 'tracking_status' not in event:
        return {
            'statusCode': 400,
            'body': json.dumps('Missing required parameters: category, timestamp, tracking_status')
        }

    # Extract parameters from the event
    category = event['category']
    timestamp = event['timestamp']
    tracking_status = event['tracking_status']

    # Create a DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'your_dynamodb_table_name' with your actual table name

    try:
        # Update item in DynamoDB table
        response = table.update_item(
            Key={
                'category': category,
                'timestamp': timestamp
            },
            UpdateExpression='SET tracking_status = :status',
            ExpressionAttributeValues={
                ':status': tracking_status
            },
            ReturnValues='UPDATED_NEW'
        )

        return {
            'statusCode': 200,
            'body': json.dumps('Update successful')
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error updating item: {str(e)}')
        }


```

---


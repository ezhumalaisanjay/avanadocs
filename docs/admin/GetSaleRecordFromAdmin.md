# Get Sale Record From Admin

### API Overview
- **Resource Name:** `sales_tracking`
- **Sub Resource Name:** `get_sales_record_fro_admin`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking/get_sales_record_fro_admin`
- **Lambda Function:** `get_sales_record_fro_admin`

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    # Replace 'your-dynamodb-table-name' with the actual name of your DynamoDB table
    dynamodb_table_name = 'Avana'
    category = event['category']  # This is the partition key (category) value
    group = event['sales_order_status']
    status = event.get('tracking_status')  # Assuming you pass the 'team' attribute in the event
    group_title  = event.get('group_title')
    user_id = event.get('UserId')
    distributor_name = event.get('distributor_name')  # Add distributor_name

    # Create the DynamoDB resource
    dynamodb = boto3.resource('dynamodb')

    # Get the DynamoDB table
    table = dynamodb.Table(dynamodb_table_name)

    # Define the filter expression with 'group', 'team', 'UserId', and 'distributor_name' attributes
    filter_expression = 'sales_order_status = :sales_order_status AND tracking_status = :val_status AND distributor_name = :val_distributor_name AND group_title = :val_group_title OR (sales_order_status = :sales_order_status AND tracking_status = :val_status AND distributor_name = :val_distributor_name AND UserId = :val_user_id)'

    # Define the expression attribute values
    expression_attribute_values = {
        ':sales_order_status': group,
        ':val_status': status,
        ':val_group_title': group_title,
        ':val_user_id': user_id,
        ':val_distributor_name': distributor_name  # Add distributor_name
    }

    # Query the DynamoDB table
    response = table.query(
        KeyConditionExpression='category = :category',
        FilterExpression=filter_expression,
        ExpressionAttributeValues={
            ':category': category,
            **expression_attribute_values
        },
        ScanIndexForward=False
    )

    # Get the items from the response
    items = response.get('Items', [])

    return {
        'statusCode': 200,
        'body': json.dumps(items, default=str)
    }


```

---


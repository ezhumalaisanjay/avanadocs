# Request Level 2 Approval

### API Overview
- **Resource Name:** `request`
- **Sub Resource Name:** `level_2_approval`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/request/level_2_approval`
- **Lambda Function:** `get_approval_MEAR`

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    dynamodb_table_name = 'Avana'
    category = event['category']  # This is the partition key (category) value
    request_status = event['request_status']  # Use "request_status" instead of "Status"
    print(category)
    print(request_status)
    
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(dynamodb_table_name)
    print(table)
    
    # Define the filter expression for "request_status" using ExpressionAttributeNames
    filter_expression = '#request_status = :val'
    
    expression_attribute_names = {'#request_status': 'request_status'}
    expression_attribute_values = {
        ':val': request_status,
        ':category': category
    }
    
    response = table.query(
        KeyConditionExpression='category = :category',
        FilterExpression=filter_expression,
        ExpressionAttributeValues=expression_attribute_values,
        ExpressionAttributeNames=expression_attribute_names
    )
    print(response)
    
    items = response.get('Items', [])
    print(items)
    
    return {
        'statusCode': 200,
        'body': json.dumps(items, default=str)
    }


```

---


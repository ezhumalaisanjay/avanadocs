# Sale Report For Distributor

### API Overview
- **Resource Name:** `salesrepot_for_distributor`
- **Method:** `GET`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/salesrepot_for_distributor`
- **Lambda Function:** `get_sales_for_distributor`

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    # Replace 'your-dynamodb-table-name' with the actual name of your DynamoDB table
    dynamodb_table_name = 'Avana'
    category = event['category']  # This is the partition key (category) value
    group = event['group']
    print(category)
    print(group)
    
    # Create the DynamoDB resource
    dynamodb = boto3.resource('dynamodb')

    # Get the DynamoDB table
    table = dynamodb.Table(dynamodb_table_name)
    print(table)
    
    # Define the filter expression with 'group' and 'team' attributes
    filter_expression = 'group_title = :val'

    # Define the expression attribute values
    expression_attribute_values = {
        ':val': group
    }

    # Query the DynamoDB table
    response = table.query(
        KeyConditionExpression='category = :category',
        FilterExpression=filter_expression,
        ExpressionAttributeValues={
            ':category': category,
            **expression_attribute_values
        }
    )
    print(response)

    # Get the items from the response
    items = response.get('Items', [])
    print(items)
    
    return {
        'statusCode': 200,
        'body': json.dumps(items, default=str)
    }

```

---


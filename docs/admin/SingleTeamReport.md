# Single Team Report

### API Overview
- **Resource Name:** `sales_tracking`
- **Sub Resource Name:** `single_team_report`
- **Method:** `GET`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking/single_team_report`
- **Lambda Function:** `Avana_get_team_report`

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    # Replace 'your-dynamodb-table-name' with the actual name of your DynamoDB table
    dynamodb_table_name = 'Avana'
    category = event['category']  # This is the partition key (category) value
    userid = event['assigner']      
    print(category)
    print(userid)
    # Create the DynamoDB resource
    dynamodb = boto3.resource('dynamodb')

    # Get the DynamoDB table
    table = dynamodb.Table(dynamodb_table_name)
    print(table)
    # Define the filter expression
    filter_expression = 'assigner = :val'

    # Define the expression attribute values
    expression_attribute_values = {':val': userid}

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
        'body': json.dumps(items,default=str)
    }


```

---


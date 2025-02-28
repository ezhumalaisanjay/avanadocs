# Team Report

### API Overview
- **Resource Name:** `sales_tracking`
- **Sub Resource Name:** `team_report`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking/team_report`
- **Lambda Function:** `Avana_get_sales_team_report`

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
    team = event.get('team')  # Assuming you pass the 'team' attribute in the event
    print(category)
    print(group)
    print(team)
    
    # Create the DynamoDB resource
    dynamodb = boto3.resource('dynamodb')

    # Get the DynamoDB table
    table = dynamodb.Table(dynamodb_table_name)
    print(table)
    
    # Define the filter expression with 'group' and 'team' attributes
    filter_expression = 'group_title = :val and team = :team'

    # Define the expression attribute values
    expression_attribute_values = {
        ':val': group,
        ':team': team
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


# Get User Profile Put

### API Overview
- **Resource Name:** `Get_user_profile`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Get_user_profile`
- **Lambda Function:** `Get_user_profile`

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    # Specify the AWS region and DynamoDB table name
    region = 'us-west-2'
    table_name = 'Avana'

    # Create a DynamoDB client
    dynamodb = boto3.resource('dynamodb', region_name=region)

    # Get the DynamoDB table
    table = dynamodb.Table(table_name)

    try:
        # Get the category value from the event
        category_value = event["category"]

        # Perform a query based on the category value
        response = table.query(
            KeyConditionExpression='category = :category',
            ExpressionAttributeValues={':category': category_value}
        )

        # Retrieve the items from the response
        items = response['Items']

        # Convert items to a list of JSON-formatted strings
        json_items = [json.dumps(item) for item in items]

        # Process the items as needed
        for json_item in json_items:
            # Do something with each JSON-formatted item
            print(json_item)

        return {
            'statusCode': 200,
            'body': json.dumps(items, default=str)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }


```

---


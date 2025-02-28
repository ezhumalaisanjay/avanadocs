# Specific Sales Yesterday

### API Overview
- **Resource Name:** `Specific_sales_yesterday`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Specific_sales_yesterday`
- **Lambda Function:** `Specific_sales_yesterday`

---


### Lambda Function
```python
import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

def lambda_handler(event, context):
    # Validate input parameters
    if 'category' not in event or 'tracking_status' not in event:
        return {
            'statusCode': 400,
            'body': json.dumps('Missing required parameters: category and/or tracking_status')
        }

    # Extract parameters from the event
    category = event["category"]
    tracking_status = event["tracking_status"]

    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')

    try:
        # Assuming "dates" is a field in your DynamoDB table
        # Extract the dates value from the event
        dates_value = event.get("dates")

        # Build the FilterExpression for querying based on the "category", "dates", and "tracking_status" fields
        filter_expression = Attr('dates').eq(dates_value) if dates_value else None
        filter_expression &= Attr('tracking_status').eq(tracking_status)

        # Use query instead of scan
        response = table.query(
            KeyConditionExpression=Key('category').eq(category),
            FilterExpression=filter_expression
        )

        # Extract and return the items from the response
        items = response.get('Items', [])

        return {
            'statusCode': 200,
            'body': json.dumps(items)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }


```

---


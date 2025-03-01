# Specific Yesterday All Sales

### API Overview
- **Resource Name:** `Specific_yesterday_all_sales`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Specific_yesterday_all_sales`
- **Lambda Function:** `Specific_yesterday_all_sales`

---


### Lambda Function
```python
import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

def lambda_handler(event, context):
    # Validate input parameters
    if 'category' not in event:
        return {
            'statusCode': 400,
            'body': json.dumps('Missing required parameter: category')
        }

    # Extract parameters from the event
    category = event["category"]

    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')

    try:
        # Assuming "dates" is a field in your DynamoDB table
        # Extract the dates value from the event
        dates_value = event["dates"]

        # Build the FilterExpression for querying based on the "category" and "dates" fields
        filter_expression = Attr('dates').eq(dates_value)

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

## IAM Policy for the Lambda Function

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:Query"
            ],
            "Resource": [
                "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Avana"
            ]
        }
    ]
}


```
---


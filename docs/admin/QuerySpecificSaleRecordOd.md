# Query Daterange Specific Sales Od

### API Overview
- **Resource Name:** `Query_date_range_specific_sales_od`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Query_date_range_specific_sales_od`
- **Lambda Function:** `Query_date_range_specific_sales_Oder`

---


### Lambda Function
```python
import json
from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Key, Attr

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    try:
        # Extract parameters from the event
        category = event.get("category")
        start_date = event.get("start_date")
        end_date = event.get("end_date")
        distributor_name = event.get("distributor_name")

        # Validate input parameters
        if not category:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing or invalid parameter: category')
            }

        # Initialize DynamoDB client
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('Avana')

        # Construct Key Condition Expression
        key_condition_expr = Key('category').eq(category)

        # Construct Filter Expression for dates
        filter_expr = None
        if start_date and end_date:
            filter_expr = Attr('dates').between(start_date, end_date)

        # Construct Filter Expression for distributor_name if provided
        if distributor_name:
            filter_expr_distributor = Attr('distributor_name').eq(distributor_name)
            if filter_expr:
                filter_expr &= filter_expr_distributor
            else:
                filter_expr = filter_expr_distributor

        # Query DynamoDB to get items
        query_params = {
            'KeyConditionExpression': key_condition_expr
        }

        if filter_expr:
            query_params['FilterExpression'] = filter_expr

        response = table.query(**query_params)

        # Extract items
        items = response.get('Items', [])
        
        # Sort items based on the 'dates' attribute in descending order
        items = sorted(items, key=lambda x: x.get('dates', ''), reverse=True)
        
        # Convert Decimal to float for JSON serialization
        items = json.loads(json.dumps(items, default=decimal_default))

        return {
            'statusCode': 200,
            'body': json.dumps({
                'count': len(items),
                'items': items
            })
        }

    except Exception as e:
        # Log the error for debugging purposes
        print(f'Error: {str(e)}')
        
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }


```

---


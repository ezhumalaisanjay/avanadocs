# Detail View Product Sale

### API Overview
- **Resource Name:** `dtailview_product_sales`
- **Method:** `PUT`
- **invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/dtailview_product_sales`
- **Lambda Function:** `dtailview_product_sale`

---


### Lambda Function
```python
import boto3

def lambda_handler(event, context):
    product_group = event.get('product_group', None)
    category = event.get('category', None)

    # Create DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'Avana' with your actual table name

    # Initialize a list to store the response data
    response_data = []

    # Build filter expression and attribute values
    filter_expression = []
    expression_attribute_names = {}
    expression_attribute_values = {}

    if product_group:
        filter_expression.append("#pg = :product_group")
        expression_attribute_names["#pg"] = "product_group"
        expression_attribute_values[":product_group"] = product_group

    if category:
        filter_expression.append("#cat = :category")
        expression_attribute_names["#cat"] = "category"
        expression_attribute_values[":category"] = category

    # Combine filter expression parts
    combined_filter_expression = " AND ".join(filter_expression) if filter_expression else None

    # Set scan parameters
    scan_params = {}
    if combined_filter_expression:
        scan_params["FilterExpression"] = combined_filter_expression
        scan_params["ExpressionAttributeNames"] = expression_attribute_names
        scan_params["ExpressionAttributeValues"] = expression_attribute_values

    # Perform the scan operation with pagination handling
    response = table.scan(**scan_params)
    response_data.extend(response.get('Items', []))

    # Continue scanning if there are more items
    while 'LastEvaluatedKey' in response:
        scan_params['ExclusiveStartKey'] = response['LastEvaluatedKey']
        response = table.scan(**scan_params)
        response_data.extend(response.get('Items', []))

    return {
        'statusCode': 200,
        'body': response_data
    }

```

---


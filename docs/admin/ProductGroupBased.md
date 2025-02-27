# Product Group Based Data

### API Overview
- **Resource Name:** `Productgroupbased_dataget`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Productgroupbased_dataget`
- **Lambda Function:** `Productgroupbased_dataget`

---


### Lambda Function
```python
import boto3

def lambda_handler(event, context):
    distributor_name = event.get('distributor_name', '')
    product_group = event.get('product_group', '')
    category = event.get('category', '')

    # Create DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'Avana' with your actual table name

    # Initialize a list to store the response data
    response_data = []

    # Query DynamoDB based on distributor_name, product_group, and category
    scan_params = {
        "FilterExpression": "#dn = :distributor_name AND #pg = :product_group AND #cat = :category",
        "ExpressionAttributeNames": {"#dn": "distributor_name", "#pg": "product_group", "#cat": "category"},
        "ExpressionAttributeValues": {":distributor_name": distributor_name, ":product_group": product_group, ":category": category}
    }

    # Perform the scan operation
    response = table.scan(**scan_params)

    # Process the response and add records to response_data
    response_data.extend(response.get('Items', []))

    return response_data


```

---


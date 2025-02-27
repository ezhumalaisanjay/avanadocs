# Get Sales Products for Sale Lead

### API Overview
- **Resource Name:** `get_sales_Products_for_sale_Lead`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/get_sales_Products_for_sale_Lead`
- **Lambda Function:** `get_sales_Products`

---


### Lambda Function
```python
import boto3
from boto3.dynamodb.conditions import Attr
import json

def lambda_handler(event, context):
    distributor_names = event.get('distributor_names', [])
    if isinstance(distributor_names, str):
        # If distributor_names is a string, convert it to a list with a single element
        distributor_names = [distributor_names]
    pr_group = event.get('product_group')
    docname = event.get('doctorsname')
    start_date = event.get('start_date')
    end_date = event.get('end_date')
    track_status = event.get('tracking_status')

    # Create DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'YourDynamoDBTableName' with your actual table name

    # Initialize a dictionary to store the aggregated information
    aggregated_info = {}

    # Initialize overall revenue, overall count, and overall sale
    overall_revenue = 0
    overall_count = 0
    overall_sale = 0

    # Iterate through each distributor name in the list
    for distributor_name in distributor_names:
        # Construct the filter expression
        filter_expression = Attr('distributor_name').eq(distributor_name)
        if pr_group:
            filter_expression &= Attr('product_group').eq(pr_group)
        if docname:
            filter_expression &= Attr('doctorsname').eq(docname)
        if start_date and end_date:
            filter_expression &= Attr('dates').between(start_date, end_date)
        if track_status:
            filter_expression &= Attr('tracking_status').eq(track_status)

        # Query DynamoDB based on category (partition key) and filter expression
        response = table.query(
            KeyConditionExpression="#category = :category",
            FilterExpression=filter_expression,
            ExpressionAttributeNames={
                "#category": "category"
            },
            ExpressionAttributeValues={
                ":category": event.get('category', '')
            }
        )

        # Extract the matching records for the current distributor name
        matching_records = response.get('Items', [])

        # Iterate through each matching record for the current distributor name
        for record in matching_records:
            doctors_name = record.get('doctorsname')
            product_group = record.get('product_group')
            tracking_status = record.get('tracking_status', '')  # Added tracking_status

            # Check if any required field is missing or empty
            if not all([doctors_name, product_group]):
                continue

            # Initialize distributor_name entry in aggregated_info if not present
            if distributor_name not in aggregated_info:
                aggregated_info[distributor_name] = {}

            # Initialize counts if not present in the aggregated_info dictionary
            if doctors_name not in aggregated_info[distributor_name]:
                aggregated_info[distributor_name][doctors_name] = {}

            if product_group not in aggregated_info[distributor_name][doctors_name]:
                aggregated_info[distributor_name][doctors_name][product_group] = {
                    'Sale_Count': 0,
                    'Lead_Count': 0,
                    'productdetial': []  # Initialize product detail list
                }

            # Update counts based on tracking_status
            if tracking_status.lower() == 'sale':
                aggregated_info[distributor_name][doctors_name][product_group]['Sale_Count'] += int(record.get('quantity', 0))

            # Add product details to the list
            product_detail = {
                "patientnumber": record.get("patientnumber", ""),
                "quantity": record.get("quantity", ""),
                "itemname": record.get("itemname", ""),
                "product_name": record.get("product_name", ""),
                "dates": record.get("dates", ""),
                "timestamp": record.get("timestamp", ""),
                "sales_order_status": record.get("sales_order_status", ""),
                "product_code": record.get("product_code", ""),
                "itemid": record.get("itemid", ""),
                "patientemail": record.get("patientemail", ""),
                "UserId": record.get("UserId", ""),
                "nickname": record.get("nickname", ""),
                "tracking_status": record.get("tracking_status", ""),
                "category": record.get("category", ""),
                "username": record.get("username", ""),
                "vendor_name": record.get("vendor_name", ""),
                "doctorsname": record.get("doctorsname", ""),
                "patientname": record.get("patientname", ""),
                "unit_price": record.get("unit_price", "")
            }

            aggregated_info[distributor_name][doctors_name][product_group]['productdetial'].append(product_detail)

    # Calculate overall revenue, overall count, and overall sale
    overall_revenue = sum(
        sum(float(detail['unit_price']) for detail in counts['productdetial'] if detail['unit_price'].replace('.', '', 1).isdigit())
        for distributor_info in aggregated_info.values()
        for doctors_info in distributor_info.values()
        for counts in doctors_info.values()
    )

    overall_count = sum(
        sum(int(detail['quantity']) if detail['quantity'].isdigit() else 0 for detail in counts['productdetial'])
        for distributor_info in aggregated_info.values()
        for doctors_info in distributor_info.values()
        for counts in doctors_info.values()
    )

    overall_sale = sum(
        counts['Sale_Count']
        for distributor_info in aggregated_info.values()
        for doctors_info in distributor_info.values()
        for counts in doctors_info.values()
    )

    # Transform aggregated_info dictionary into a list for the desired response format
    response_data = []
    for distributor_name, doctors_info in aggregated_info.items():
        for doctors_name, product_groups in doctors_info.items():
            for product_group, counts in product_groups.items():
                # Check if any required field is missing or empty
                if not all([doctors_name, product_group]):
                    continue
                response_data.append({
                    'distributor_name': distributor_name,
                    'doctors_name': doctors_name,
                    'product_group': product_group,
                    'Sale_Count': counts['Sale_Count'],
                    'Lead_Count': counts['Lead_Count'],
                    'Total_Count': sum(int(detail['quantity']) if detail['quantity'].isdigit() else 0 for detail in counts['productdetial']),
                    'total_revenue': sum(float(detail['unit_price']) for detail in counts['productdetial'] if detail['unit_price'].replace('.', '', 1).isdigit()),
                    'productdetial': counts['productdetial']
                })

    # Return the aggregated_info, overall_revenue, overall_count, and overall_sale
    return {'aggregated_info': response_data, 'overall_revenue': overall_revenue, 'overall_count': overall_count, 'overall_sale': overall_sale}


```

---


# Distributor Count

### API Overview
- **Resource Name:** `distributor_with_count`
- **Method:** `PUT`
- **invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/distributor_with_count`
- **Lambda Function:** `distributor_records_Count`

---


### Lambda Function
```python
import json
import re
import boto3
import logging
from boto3.dynamodb.conditions import Key, Attr

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    distributor_names = event.get('distributor_name', [])
    if isinstance(distributor_names, str):
        # If distributor_names is a string, convert it to a list with a single element
        distributor_names = [distributor_names]
    category = event.get('category', '')

    # Optional parameters
    product_group = event.get('product_group')
    doctorsname = event.get('doctorsname')
    start_date = event.get('start_date')
    end_date = event.get('end_date')
    track_status = event.get('tracking_status')

    # Create DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'YourDynamoDBTableName' with your actual table name

    # Initialize a list to store the response data
    response_data = []

    # Initialize variables for entire counts
    entire_total_count = 0
    entire_sale_count = 0
    entire_revenue_count = 0

    # Iterate through each distributor name
    for distributor_name in distributor_names:
        # Initialize total counts for sale and lead
        total_sale_count = 0
        total_revenue = 0
        total_quantity_count = 0
        matching_records = []

        last_evaluated_key = None

        while True:
            # Construct the query parameters
            query_params = {
                'KeyConditionExpression': Key('category').eq(category)
            }

            # Add FilterExpression based on optional parameters
            filter_expression = Attr('distributor_name').eq(distributor_name)
            if product_group:
                filter_expression &= Attr('product_group').eq(product_group)
            if doctorsname:
                filter_expression &= Attr('doctorsname').eq(doctorsname)
            if start_date and end_date:
                filter_expression &= Attr('dates').between(start_date, end_date)
            if track_status:
                filter_expression &= Attr('tracking_status').eq(track_status)

            query_params['FilterExpression'] = filter_expression
            
            if last_evaluated_key:
                query_params['ExclusiveStartKey'] = last_evaluated_key

            response = table.query(**query_params)

            # Extract the matching records
            matching_records.extend(response.get('Items', []))

            # Update LastEvaluatedKey
            last_evaluated_key = response.get('LastEvaluatedKey')

            # Break the loop if LastEvaluatedKey is not present
            if not last_evaluated_key:
                break

        # Calculate total_sale_count, total_revenue, and total_quantity
        for record in matching_records:
            tracking_status = record.get('tracking_status', '')

            # Determine the unit price attribute
            unit_price_str = record.get('unitprice', None)
            if unit_price_str is None:
                unit_price_str = record.get('unit_price', '')

            # Get quantity and convert it to numeric value if it's a string
            quantity_str = record.get('quantity', '0')
            if isinstance(quantity_str, str):
                quantity_match = re.search(r'\d+', quantity_str)
                if quantity_match:
                    quantity = int(quantity_match.group())
                else:
                    quantity = 0
            else:
                quantity = quantity_str

            # Calculate revenue and update total_revenue
            if unit_price_str:
                unit_price = float(unit_price_str)
                revenue = quantity * unit_price
                total_revenue += revenue

            # Increment total_sale_count by the quantity where tracking_status is "Sale"
            if tracking_status == 'Sale':
                total_sale_count += quantity

            # Increment total_quantity_count by the quantity for all records
            total_quantity_count += quantity

        # Add distributor_name, counts, total revenue, total quantity, and matching records to the response data
        response_data.append({
            'distributor_name': distributor_name,
            'Total_Count': total_quantity_count,
            'Sale_Count': total_sale_count,  # Sale count now represents the total quantity where status is "Sale"
            'Total_Revenue': total_revenue,
            'Matching_Records': matching_records
        })

        # Update entire counts and quantities
        entire_total_count += total_quantity_count
        entire_sale_count += total_sale_count
        entire_revenue_count += total_revenue

    return {'response_data': response_data,
            'entire_total_count': entire_total_count,
            'entire_sale_count': entire_sale_count,
            'entire_revenue_count': entire_revenue_count
    }
```

---


# Product Sale Datefilter

### API Overview
- **Resource Name:** `product_sale_datefilter`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/product_sale_datefilter`
- **Lambda Function:** `date_filter_Product_sale`

---


### Lambda Function
```python
import boto3
import re
from datetime import datetime

def lambda_handler(event, context):
    category = event.get('category', '')
    start_date = datetime.strptime(event.get('start_date'), '%Y-%m-%d')
    end_date = datetime.strptime(event.get('end_date'), '%Y-%m-%d')

    # Create DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'Avana' with your actual table name

    # Initialize a dictionary to store the aggregated information
    aggregated_info = {}

    # Pagination support
    last_evaluated_key = None

    # Loop to handle pagination
    while True:
        # Query DynamoDB based on category and date range
        scan_params = {
            "FilterExpression": "#dates BETWEEN :start_date AND :end_date AND category = :category",
            "ExpressionAttributeValues": {
                ":start_date": start_date.strftime('%Y-%m-%d'),
                ":end_date": end_date.strftime('%Y-%m-%d'),
                ":category": category
            },
            "ExpressionAttributeNames": {
                "#dates": "dates"
            }
        }
        # Append LastEvaluatedKey to scan_params if it exists
        if last_evaluated_key:
            scan_params['ExclusiveStartKey'] = last_evaluated_key

        # Perform the scan operation
        response = table.scan(**scan_params)

        # Process the response and aggregate information
        last_evaluated_key = response.get('LastEvaluatedKey')
        process_response_with_category(response, aggregated_info, start_date, end_date)

        # Break loop if no more pages are available
        if not last_evaluated_key:
            break

    # Transform aggregated_info dictionary into a list for the desired response format
    overall_counts, overall_total_revenue, response_data, overall_total_records = format_response(aggregated_info)

    # Construct the response
    response = {
        "overall_sale_count": overall_counts["overall_sale_count"],
        "overall_lead_count": overall_counts["overall_lead_count"],
        "overall_total_count": overall_counts["overall_total_count"],
        "overall_total_revenue": overall_total_revenue,  # Include overall total revenue
        "overall_total_records": overall_total_records,  # Include overall total record length
        "response_data": response_data
    }

    return response

def process_response_with_category(response, aggregated_info, start_date, end_date):
    matching_records = response.get('Items', [])

    # Iterate through each matching record
    for record in matching_records:
        product_group = record.get('product_group')

        # Skip processing if product_group is empty
        if not product_group:
            continue

        # Check if the record date is within the specified range
        record_date = datetime.strptime(record.get('dates'), '%Y-%m-%d')
        if start_date <= record_date <= end_date:
            # Extract quantity and convert it to an integer
            quantity_str = record.get('quantity', '1')
            quantity_match = re.search(r'\d+', quantity_str)
            if quantity_match:
                quantity = int(quantity_match.group())
            else:
                quantity = 1  # Default quantity is 1 if no numeric value found

            # Initialize counts if not present in the aggregated_info dictionary
            product_key = product_group  # Use product_group as key
            if product_key not in aggregated_info:
                aggregated_info[product_key] = {
                    'Sale_Count': 0,
                    'Lead_Count': 0,
                    'Total_Count': 0,
                    'Total_revenue': 0,  # Add Total_revenue field
                    'product_details': []  # Initialize product details list
                }

            # Update counts based on tracking_status and quantity
            tracking_status = record.get('tracking_status', '').lower()
            if tracking_status == 'sale':
                aggregated_info[product_key]['Sale_Count'] += quantity
            elif tracking_status == 'lead':
                aggregated_info[product_key]['Lead_Count'] += quantity

            # Add product details to the list
            product_detail = {}
            potential_field_names = ["unit_price", "unitprice"]
            for field_name in potential_field_names:
                if field_name in record:
                    product_detail["unit_price"] = record[field_name]
                    break

            product_detail.update({key: record.get(key, "") for key in [
                "patientnumber", "quantity", "itemname", "product_name",
                "dates", "timestamp", "sales_order_status", "product_code",
                "UserId", "nickname", "tracking_status", "category",
                "username", "vendor_name", "doctorsname", "patientname","unit_price"
            ]})

            # Calculate revenue for the transaction
            unit_price = float(product_detail.get("unit_price", 0)) if product_detail.get("unit_price") else 0
            revenue = unit_price * int(product_detail.get("quantity", 1))
            product_detail["revenue"] = revenue

            aggregated_info[product_key]['product_details'].append(product_detail)

            # Increment total count and total revenue for each record (considering quantity and revenue)
            aggregated_info[product_key]['Total_Count'] += quantity
            aggregated_info[product_key]['Total_revenue'] += revenue

def format_response(aggregated_info):
    overall_sale_count = 0
    overall_lead_count = 0
    overall_total_count = 0
    overall_total_revenue = 0
    overall_total_records = 0  # Initialize overall total record length
    response_data = []

    for product_key, counts in aggregated_info.items():
        # Check if it's the 'Total_Count' entry
        if product_key != 'Total_Count':
            sale_count = counts.get('Sale_Count', 0)
            lead_count = counts.get('Lead_Count', 0)
            total_count = counts.get('Total_Count', 0)
            total_revenue = counts.get('Total_revenue', 0)

            overall_sale_count += sale_count
            overall_lead_count += lead_count
            overall_total_count += total_count
            overall_total_revenue += total_revenue

            # Add the length of product_details list to overall_total_records
            overall_total_records += len(counts.get('product_details', []))

            response_data.append({
                'product_group': product_key,
                'Sale_Count': sale_count,
                'Lead_Count': lead_count,
                'Total_Count': total_count,
                'Total_revenue': total_revenue,
                'product_details': counts.get('product_details', [])
            })

    overall_counts = {
        'overall_sale_count': overall_sale_count,
        'overall_lead_count': overall_lead_count,
        'overall_total_count': overall_total_count
    }

    return overall_counts, overall_total_revenue, response_data, overall_total_records


```

---


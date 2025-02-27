# Get Doctor Sale Count

### API Overview
- **Resource Name:** `get_doctor_sale_count`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/get_doctor_sale_count`
- **Lambda Function:** `doctor_sale_im`

---


### Lambda Function
```python
import boto3
import re
import logging
from boto3.dynamodb.conditions import Key, Attr

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    distributor_names = event.get('distributor_names', [])
    category = event.get('category', '')
    start_date = event.get('start_date')
    end_date = event.get('end_date')
    product_group = event.get('product_group', '')
    doctors_name_filter = event.get('doctorsname', '')

    # Create DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'Avana' with your actual table name

    # Initialize a dictionary to store the aggregated information
    aggregated_info = {}

    # Pagination support
    last_evaluated_key = None

    # Loop to handle pagination
    while True:
        if distributor_names:
            # If distributor_names are provided, iterate through each distributor name
            for distributor_name in distributor_names:
                # Construct the query parameters
                query_params = {
                    "KeyConditionExpression": Key('category').eq(category),
                    "FilterExpression": Attr('distributor_name').eq(distributor_name)
                }

                # Add additional filters if provided
                if product_group:
                    query_params['FilterExpression'] &= Attr('product_group').eq(product_group)
                if doctors_name_filter:
                    query_params['FilterExpression'] &= Attr('doctorsname').eq(doctors_name_filter)
                if start_date and end_date:
                    query_params['FilterExpression'] &= Attr('dates').between(start_date, end_date)

                # Append LastEvaluatedKey to query_params if it exists
                if last_evaluated_key:
                    query_params['ExclusiveStartKey'] = last_evaluated_key

                # Perform the query operation
                try:
                    response = table.query(**query_params)
                except Exception as e:
                    logger.error(f"Error querying DynamoDB: {e}")
                    return {"statusCode": 500, "body": "Error querying DynamoDB"}

                # Process the response and aggregate information
                last_evaluated_key = response.get('LastEvaluatedKey')
                process_response(response, distributor_name, aggregated_info)
        else:
            # Construct the query parameters
            query_params = {
                "KeyConditionExpression": Key('category').eq(category)
            }

            # Initialize FilterExpression if necessary
            filter_expression = None

            # Add additional filters if provided
            if product_group:
                filter_expression = Attr('product_group').eq(product_group)
            if doctors_name_filter:
                if filter_expression:
                    filter_expression &= Attr('doctorsname').eq(doctors_name_filter)
                else:
                    filter_expression = Attr('doctorsname').eq(doctors_name_filter)
            if start_date and end_date:
                if filter_expression:
                    filter_expression &= Attr('dates').between(start_date, end_date)
                else:
                    filter_expression = Attr('dates').between(start_date, end_date)

            if filter_expression:
                query_params['FilterExpression'] = filter_expression

            # Append LastEvaluatedKey to query_params if it exists
            if last_evaluated_key:
                query_params['ExclusiveStartKey'] = last_evaluated_key

            # Perform the query operation
            try:
                response = table.query(**query_params)
            except Exception as e:
                logger.error(f"Error querying DynamoDB: {e}")
                return {"statusCode": 500, "body": "Error querying DynamoDB"}

            # Process the response and aggregate information
            last_evaluated_key = response.get('LastEvaluatedKey')
            process_response_with_category(response, aggregated_info)

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
        "overall_total_revenue": overall_total_revenue,
        "overall_total_records": overall_total_records,
        "response_data": response_data
    }

    return response

def process_response(response, distributor_name, aggregated_info):
    matching_records = response.get('Items', [])

    for record in matching_records:
        doctors_name = record.get('doctorsname')

        if not doctors_name:
            continue

        quantity = extract_quantity(record.get('quantity', '1'))

        if distributor_name not in aggregated_info:
            aggregated_info[distributor_name] = {}
        if doctors_name not in aggregated_info[distributor_name]:
            aggregated_info[distributor_name][doctors_name] = initialize_counts()

        update_counts(record, aggregated_info[distributor_name][doctors_name], quantity)
        aggregated_info[distributor_name][doctors_name]['matching_records'].append(record)

def process_response_with_category(response, aggregated_info):
    matching_records = response.get('Items', [])

    for record in matching_records:
        distributor_name = record.get('distributor_name')
        doctors_name = record.get('doctorsname')

        if not doctors_name or not distributor_name:
            continue

        quantity = extract_quantity(record.get('quantity', '1'))

        if distributor_name not in aggregated_info:
            aggregated_info[distributor_name] = {}
        if doctors_name not in aggregated_info[distributor_name]:
            aggregated_info[distributor_name][doctors_name] = initialize_counts()

        update_counts(record, aggregated_info[distributor_name][doctors_name], quantity)
        aggregated_info[distributor_name][doctors_name]['matching_records'].append(record)

def extract_quantity(quantity_str):
    quantity_match = re.search(r'\d+', quantity_str)
    return int(quantity_match.group()) if quantity_match else 1

def initialize_counts():
    return {
        'Sale_Count': 0,
        'Lead_Count': 0,
        'Total_Count': 0,
        'Total_revenue': 0,
        'matching_records': []
    }

def update_counts(record, doctor_info, quantity):
    tracking_status = record.get('tracking_status', '').lower()
    if tracking_status == 'sale':
        doctor_info['Sale_Count'] += quantity
    elif tracking_status == 'lead':
        doctor_info['Lead_Count'] += quantity

    unit_price = float(record.get("unit_price", 0)) if record.get("unit_price") else 0
    revenue = unit_price * quantity

    doctor_info['Total_Count'] += quantity
    doctor_info['Total_revenue'] += revenue

def format_response(aggregated_info):
    overall_sale_count = 0
    overall_lead_count = 0
    overall_total_count = 0
    overall_total_revenue = 0
    overall_total_records = 0
    response_data = []

    for distributor_name, doctors_info in aggregated_info.items():
        for doctors_name, counts in doctors_info.items():
            sale_count = counts.get('Sale_Count', 0)
            lead_count = counts.get('Lead_Count', 0)
            total_count = counts.get('Total_Count', 0)
            total_revenue = counts.get('Total_revenue', 0)

            overall_sale_count += sale_count
            overall_lead_count += lead_count
            overall_total_count += total_count
            overall_total_revenue += total_revenue
            overall_total_records += 1

            response_data.append({
                'distributor_name': distributor_name,
                'doctors_name': doctors_name,
                'Sale_Count': sale_count,
                'Lead_Count': lead_count,
                'Total_Count': total_count,
                'Total_revenue': total_revenue,
                'Matching_Records': counts['matching_records']
            })

    overall_counts = {
        'overall_sale_count': overall_sale_count,
        'overall_lead_count': overall_lead_count,
        'overall_total_count': overall_total_count
    }

    return overall_counts, overall_total_revenue, response_data, overall_total_records


```

---


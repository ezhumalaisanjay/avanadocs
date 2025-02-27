# Product Group

### API Overview
- **Resource Name:** `gat_Dr_Product_Group`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/get_sales_Products_for_sale_Lead/gat_Dr_Product_Group`
- **Lambda Function:** `gat_Dr_Product_Group`

---


### Lambda Function
```python
import boto3
import re

def lambda_handler(event, context):
    category = event.get('category', '')

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'Avana' with your actual table name

    aggregated_info = {}

    last_evaluated_key = None

    while True:
        scan_params = {
            "FilterExpression": "category = :category",
            "ExpressionAttributeValues": {
                ":category": category
            }
        }
        if last_evaluated_key:
            scan_params['ExclusiveStartKey'] = last_evaluated_key

        response = table.scan(**scan_params)

        last_evaluated_key = response.get('LastEvaluatedKey')
        process_response_with_category(response, aggregated_info)

        if not last_evaluated_key:
            break

    overall_counts, overall_total_revenue, response_data, overall_total_records = format_response(aggregated_info)

    response = {
        "overall_sale_count": overall_counts["overall_sale_count"],
        "overall_lead_count": overall_counts["overall_lead_count"],
        "overall_total_count": overall_counts["overall_total_count"],
        "overall_total_revenue": overall_total_revenue,
        "overall_total_records": overall_total_records,
        "response_data": response_data
    }

    return response


def process_response_with_category(response, aggregated_info):
    matching_records = response.get('Items', [])

    for record in matching_records:
        product_group = record.get('product_group')

        if not product_group:
            continue

        quantity_str = record.get('quantity', '1')
        quantity_match = re.search(r'\d+', quantity_str)
        if quantity_match:
            quantity = int(quantity_match.group())
        else:
            quantity = 1

        if 'Total_Count' not in aggregated_info:
            aggregated_info['Total_Count'] = {}
        if product_group not in aggregated_info['Total_Count']:
            aggregated_info['Total_Count'][product_group] = {
                'Sale_Count': 0,
                'Lead_Count': 0,
                'Total_Count': 0,
                'Total_revenue': 0,
                'Matching_Records': []  # Add an empty list to store matching records
            }

        tracking_status = record.get('tracking_status', '').lower()
        if tracking_status == 'sale':
            aggregated_info['Total_Count'][product_group]['Sale_Count'] += quantity
        elif tracking_status == 'lead':
            aggregated_info['Total_Count'][product_group]['Lead_Count'] += quantity

        unit_price = float(record.get("unit_price", 0)) if record.get("unit_price") else 0
        revenue = unit_price * int(record.get("quantity", 1))

        aggregated_info['Total_Count'][product_group]['Total_Count'] += quantity
        aggregated_info['Total_Count'][product_group]['Total_revenue'] += revenue
        
        # Append record details to the 'Matching_Records' list
        aggregated_info['Total_Count'][product_group]['Matching_Records'].append(record)


def format_response(aggregated_info):
    overall_sale_count = 0
    overall_lead_count = 0
    overall_total_count = 0
    overall_total_revenue = 0
    overall_total_records = 0
    response_data = []

    for product_group, counts in aggregated_info.get('Total_Count', {}).items():
        sale_count = counts.get('Sale_Count', 0)
        lead_count = counts.get('Lead_Count', 0)
        total_count = counts.get('Total_Count', 0)
        total_revenue = counts.get('Total_revenue', 0)
        matching_records = counts.get('Matching_Records', [])

        overall_sale_count += sale_count
        overall_lead_count += lead_count
        overall_total_count += total_count
        overall_total_revenue += total_revenue

        response_data.append({
            'product_group': product_group,
            'Sale_Count': sale_count,
            'Lead_Count': lead_count,
            'Total_Count': total_count,
            'Total_revenue': total_revenue,
            'Matching_Records': matching_records  # Include matching records in the response
        })

        overall_total_records += len(matching_records)

    overall_counts = {
        'overall_sale_count': overall_sale_count,
        'overall_lead_count': overall_lead_count,
        'overall_total_count': overall_total_count
    }

    return overall_counts, overall_total_revenue, response_data, overall_total_records


```

---


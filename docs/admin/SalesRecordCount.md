# Sales Record Count



:::note

This documentation provides details about the `sales_record_count` API, which retrieves aggregated sales and lead data based on **distributor** names and **category** filters.

:::


## Overview

**Resource Name:** sales_record_count

**Invoke URL:** https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_record_count

**Lambda Function Name:** sales_record_with_count

**Method**: PUT

## Lambda Function

```python
import boto3
import re

def lambda_handler(event, context):
    distributor_names = event.get('distributor_names', [])
    category = event.get('category', '')

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'Avana' with your actual table name

    aggregated_info = {}

    last_evaluated_key = None

    while True:
        if distributor_names:
            for distributor_name in distributor_names:
                scan_params = {
                    "FilterExpression": "distributor_name = :distributor_name AND category = :category",
                    "ExpressionAttributeValues": {
                        ":distributor_name": distributor_name,
                        ":category": category
                    }
                }
                if last_evaluated_key:
                    scan_params['ExclusiveStartKey'] = last_evaluated_key

                response = table.scan(**scan_params)

                last_evaluated_key = response.get('LastEvaluatedKey')
                process_response(response, distributor_name, aggregated_info)
        else:
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


def process_response(response, distributor_name, aggregated_info):
    matching_records = response.get('Items', [])

    for record in matching_records:
        doctorsname = record.get('doctorsname')

        if not doctorsname:
            continue

        quantity_str = record.get('quantity', '1')
        quantity_match = re.search(r'\d+', quantity_str)
        if quantity_match:
            quantity = int(quantity_match.group())
        else:
            quantity = 1

        if distributor_name not in aggregated_info:
            aggregated_info[distributor_name] = {}
        if doctorsname not in aggregated_info[distributor_name]:
            aggregated_info[distributor_name][doctorsname] = {
                'Sale_Count': 0,
                'Lead_Count': 0,
                'Total_Count': 0,
                'Total_revenue': 0
            }

        tracking_status = record.get('tracking_status', '').lower()
        if tracking_status == 'sale':
            aggregated_info[distributor_name][doctorsname]['Sale_Count'] += quantity
        elif tracking_status == 'lead':
            aggregated_info[distributor_name][doctorsname]['Lead_Count'] += quantity

        unit_price = float(record.get("unit_price", 0)) if record.get("unit_price") else 0
        revenue = unit_price * int(record.get("quantity", 1))

        aggregated_info[distributor_name][doctorsname]['Total_Count'] += quantity
        aggregated_info[distributor_name][doctorsname]['Total_revenue'] += revenue


def process_response_with_category(response, aggregated_info):
    matching_records = response.get('Items', [])

    for record in matching_records:
        distributor_name = record.get('distributor_name')
        doctorsname = record.get('doctorsname')

        if not doctorsname or not distributor_name:
            continue

        quantity_str = record.get('quantity', '1')
        quantity_match = re.search(r'\d+', quantity_str)
        if quantity_match:
            quantity = int(quantity_match.group())
        else:
            quantity = 1

        if distributor_name not in aggregated_info:
            aggregated_info[distributor_name] = {}
        if doctorsname not in aggregated_info[distributor_name]:
            aggregated_info[distributor_name][doctorsname] = {
                'Sale_Count': 0,
                'Lead_Count': 0,
                'Total_Count': 0,
                'Total_revenue': 0
            }

        tracking_status = record.get('tracking_status', '').lower()
        if tracking_status == 'sale':
            aggregated_info[distributor_name][doctorsname]['Sale_Count'] += quantity
        elif tracking_status == 'lead':
            aggregated_info[distributor_name][doctorsname]['Lead_Count'] += quantity

        unit_price = float(record.get("unit_price", 0)) if record.get("unit_price") else 0
        revenue = unit_price * int(record.get("quantity", 1))

        aggregated_info[distributor_name][doctorsname]['Total_Count'] += quantity
        aggregated_info[distributor_name][doctorsname]['Total_revenue'] += revenue


def format_response(aggregated_info):
    overall_sale_count = 0
    overall_lead_count = 0
    overall_total_count = 0
    overall_total_revenue = 0
    overall_total_records = 0
    response_data = []

    for distributor_name, doctors_info in aggregated_info.items():
        for doctorsname, counts in doctors_info.items():
            if doctorsname != 'Total_Count':
                sale_count = counts.get('Sale_Count', 0)
                lead_count = counts.get('Lead_Count', 0)
                total_count = counts.get('Total_Count', 0)
                total_revenue = counts.get('Total_revenue', 0)

                overall_sale_count += sale_count
                overall_lead_count += lead_count
                overall_total_count += total_count
                overall_total_revenue += total_revenue

                response_data.append({
                    'distributor_name': distributor_name,
                    'doctors_name': doctorsname,
                    'Sale_Count': sale_count,
                    'Lead_Count': lead_count,
                    'Total_Count': total_count,
                    'Total_revenue': total_revenue
                })

    overall_counts = {
        'overall_sale_count': overall_sale_count,
        'overall_lead_count': overall_lead_count,
        'overall_total_count': overall_total_count
    }

    return overall_counts, overall_total_revenue, response_data, overall_total_records


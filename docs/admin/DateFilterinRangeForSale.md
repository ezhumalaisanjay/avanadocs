# Date Filter By Range For Sale

- **Resource Name** : `datefitter_indaterange_for_sale`
- **Method** : `PUT`
- **Invoke URL** : `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/datefitter_indaterange_for_sale`

---

### Lambda Function

```python
import boto3
import json
import re

def lambda_handler(event, context):
    category = event.get('category', '')
    start_date = event.get('start_date', None)
    end_date = event.get('end_date', None)

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')

    all_items = []
    partition_key = "category"
    filter_expression = []

    if start_date and end_date:
        filter_expression.append("#dates between :start_date and :end_date")
    if 'distributor_name' in event:
        filter_expression.append("#distributor_name = :distributor_name")
    if 'product_group' in event:
        filter_expression.append("#product_group = :product_group")
    if 'doctorsname' in event:
        filter_expression.append("#doctorsname = :doctorsname")
    if 'tracking_status' in event:
        filter_expression.append("#tracking_status = :tracking_status")
    if 'group_title' in event and event['group_title']:
        filter_expression.append("#group_title = :group_title")

    filter_expression_str = " AND ".join(filter_expression)

    expression_attribute_names = {}
    expression_attribute_values = {}

    if start_date and end_date:
        expression_attribute_names["#dates"] = "dates"
        expression_attribute_values[":start_date"] = start_date
        expression_attribute_values[":end_date"] = end_date
    if 'distributor_name' in event:
        expression_attribute_names["#distributor_name"] = "distributor_name"
        expression_attribute_values[":distributor_name"] = event['distributor_name']
    if 'product_group' in event:
        expression_attribute_names["#product_group"] = "product_group"
        expression_attribute_values[":product_group"] = event['product_group']
    if 'doctorsname' in event:
        expression_attribute_names["#doctorsname"] = "doctorsname"
        expression_attribute_values[":doctorsname"] = event['doctorsname']
    if 'tracking_status' in event:
        expression_attribute_names["#tracking_status"] = "tracking_status"
        expression_attribute_values[":tracking_status"] = event['tracking_status']
    if 'group_title' in event and event['group_title']:
        expression_attribute_names["#group_title"] = "group_title"
        expression_attribute_values[":group_title"] = event['group_title']

    last_evaluated_key = None
    while True:
        query_params = {
            'KeyConditionExpression': boto3.dynamodb.conditions.Key(partition_key).eq(category),
            'ExpressionAttributeNames': expression_attribute_names,
            'ExpressionAttributeValues': expression_attribute_values
        }
        if last_evaluated_key:
            query_params['ExclusiveStartKey'] = last_evaluated_key
        if filter_expression_str:
            query_params['FilterExpression'] = filter_expression_str

        response = table.query(**query_params)
        all_items.extend(response['Items'])
        last_evaluated_key = response.get('LastEvaluatedKey')
        if not last_evaluated_key:
            break

    aggregated_info = {}
    entire_quantity_count = 0

    for record in all_items:
        distributor_name = record.get('distributor_name')
        tracking_status = record.get('tracking_status', '')
        quantity_str = record.get('quantity', '0')
        quantity_match = re.search(r'\d+', quantity_str)
        quantity = int(quantity_match.group()) if quantity_match else 0

        if distributor_name not in aggregated_info:
            aggregated_info[distributor_name] = {
                "distributor_name": distributor_name,
                "total_records_count": 0,
                "sales_count": 0,
                "matching_records": 0,
                "revenue": 0,
                "records": []
            }

        entire_quantity_count += quantity
        aggregated_info[distributor_name]["total_records_count"] += quantity
        if tracking_status == "Sale":
            aggregated_info[distributor_name]["sales_count"] += quantity

        revenue = 0
        if quantity and ('unitprice' in record or 'unit_price' in record):
            try:
                revenue = float(quantity) * float(record.get('unitprice', record.get('unit_price', 0)))
            except ValueError:
                revenue = 0

        aggregated_info[distributor_name]["revenue"] += revenue
        aggregated_info[distributor_name]["records"].append(record)
        aggregated_info[distributor_name]["matching_records"] += 1

    entire_total_count = sum(info["total_records_count"] for info in aggregated_info.values())
    entire_sale_count = sum(info["sales_count"] for info in aggregated_info.values())
    entire_revenue_count = sum(info["revenue"] for info in aggregated_info.values())

    response_data = list(aggregated_info.values())

    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Lambda function executed successfully!',
            'response_data': response_data,
            'entire_total_count': entire_total_count,
            'entire_sale_count': entire_sale_count,
            'entire_revenue_count': entire_revenue_count,
            'entire_quantity_count': entire_quantity_count
        })
    }
```

---

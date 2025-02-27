# Product Based Sales Records

### API Overview
- **Resource Name:** `product_based_get_Salerecords`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/product_based_get_Salerecords`
- **Lambda Function:** `product_based_get_Salerecords`

---


### Lambda Function
```python
import boto3
import json
from collections import defaultdict
from datetime import datetime, timedelta

def get_month_start_end(year, month):
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    return start_date, end_date

def lambda_handler(event, context):
    dynamodb_table_name = 'Avana'
    category = event['category']
    userid = event['UserId']
    tracking_status_default = event['tracking_status']
    product_group = event.get('product_group', '')  # Default to empty string if not provided
    
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(dynamodb_table_name)
    
    filter_expression = 'UserId = :userid AND tracking_status = :tracking_status AND category = :category'
    expression_attribute_values = {
        ':userid': userid,
        ':tracking_status': tracking_status_default,
        ':category': category
    }
    
    if product_group:
        filter_expression += ' AND product_group = :product_group'
        expression_attribute_values[':product_group'] = product_group
    
    items = []
    last_evaluated_key = None
    
    while True:
        scan_params = {
            'FilterExpression': filter_expression,
            'ExpressionAttributeValues': expression_attribute_values,
        }
        
        if last_evaluated_key:
            scan_params['ExclusiveStartKey'] = last_evaluated_key
        
        response = table.scan(**scan_params)
        queried_items = response.get('Items', [])
        
        items.extend(queried_items)
        
        last_evaluated_key = response.get('LastEvaluatedKey')
        if not last_evaluated_key:
            break
    
    # Sort items in descending order based on a relevant attribute, if needed
    # For example, sort by timestamp
    items.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    
    # Get the current and previous month start and end dates
    now = datetime.now()
    current_year = now.year
    current_month = now.month
    
    if current_month == 1:
        previous_year = current_year - 1
        previous_month = 12
    else:
        previous_year = current_year
        previous_month = current_month - 1
    
    current_month_start, current_month_end = get_month_start_end(current_year, current_month)
    previous_month_start, previous_month_end = get_month_start_end(previous_year, previous_month)
    
    # Group items by product_group and calculate monthly sales quantity and revenue
    product_groups = defaultdict(list)
    current_month_quantity = 0
    current_month_revenue = 0.0
    previous_month_quantity = 0
    previous_month_revenue = 0.0

    for item in items:
        pg = item.get('product_group', 'Unknown')  # Default to 'Unknown' if product_group is missing
        if pg == product_group or not product_group:
            record = {
                "patientnumber": item.get("patientnumber", ""),
                "dates": item.get("dates", ""),
                "unit_price": item.get("unit_price", ""),
                "product_code": item.get("product_code", ""),
                "sales_record_id": item.get("sales_record_id", ""),
                "patientemail": item.get("patientemail", ""),
                "product_id": item.get("product_id", ""),
                "UserId": item.get("UserId", ""),
                "nickname": item.get("nickname", ""),
                "tracking_status": item.get("tracking_status", ""),
                "doctorsname": item.get("doctorsname", ""),
                "group_title": item.get("group_title", ""),
                "Name": item.get("Name", ""),
                "product_group": item.get("product_group", ""),
                "quantity": item.get("quantity", 0),
                "assigner": item.get("assigner", ""),
                "product_name": item.get("product_name", ""),
                "distributor_name": item.get("distributor_name", ""),
                "timestamp": item.get("timestamp", ""),
                "record_id": item.get("record_id", ""),
                "sales_order_status": item.get("sales_order_status", ""),
                "category": item.get("category", ""),
                "doctors_name": item.get("doctors_name", ""),
                "username": item.get("username", ""),
                "patientname": item.get("patientname", "")
            }
        
            # Parse the record's date
            if record["timestamp"]:
                try:
                    record_date = datetime.fromisoformat(record["timestamp"])
                except ValueError:
                    continue  # Skip records with invalid date formats
                
                if current_month_start <= record_date < current_month_end:
                    current_month_quantity += int(record.get("quantity", 0))
                    current_month_revenue += float(record.get("unit_price", 0.0)) * int(record.get("quantity", 0))
                elif previous_month_start <= record_date < previous_month_end:
                    previous_month_quantity += int(record.get("quantity", 0))
                    previous_month_revenue += float(record.get("unit_price", 0.0)) * int(record.get("quantity", 0))

            product_groups[pg].append(record)

    # Prepare the sale_records list
    sale_records = []

    for pg, records in product_groups.items():
        sale_records.extend(records)

    response = {
        'statusCode': 200,
        'body': json.dumps({
            'product_group': product_group,
            'Records': sale_records,
            'CurrentMonthQuantity': current_month_quantity,
            'CurrentMonthRevenue': current_month_revenue,
            'PreviousMonthQuantity': previous_month_quantity,
            'PreviousMonthRevenue': previous_month_revenue
        }, default=str)
    }
    
    return response


```

---


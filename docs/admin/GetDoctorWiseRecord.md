# Get Doctor Wise Records

### API Overview
- **Resource Name:** `get_doctorwiserecords`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/get_doctorwiserecords`
- **Lambda Function:** `get_doctorwiserecords`

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
    
    # Group items by product_group and doctorsname, and calculate monthly sales quantity and revenue
    grouped_data = defaultdict(lambda: defaultdict(list))
    monthly_totals = {
        'CurrentMonth': {'quantity': 0, 'revenue': 0.0},
        'PreviousMonth': {'quantity': 0, 'revenue': 0.0}
    }

    for item in items:
        pg = item.get('product_group', 'Unknown')  # Default to 'Unknown' if product_group is missing
        doctor = item.get('doctorsname', 'Unknown')  # Default to 'Unknown' if doctorsname is missing
        
        quantity = int(item.get('quantity', 0))  # Ensure quantity is an integer
        unit_price = float(item.get('unit_price', 0.0))  # Ensure unit_price is a float
        revenue = quantity * unit_price  # Calculate revenue
        
        record = {
            "patientnumber": item.get("patientnumber", ""),
            "dates": item.get("dates", ""),
            "unit_price": unit_price,
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
            "quantity": quantity,
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
                monthly_totals['CurrentMonth']['quantity'] += quantity
                monthly_totals['CurrentMonth']['revenue'] += revenue
            elif previous_month_start <= record_date < previous_month_end:
                monthly_totals['PreviousMonth']['quantity'] += quantity
                monthly_totals['PreviousMonth']['revenue'] += revenue

        grouped_data[pg][doctor].append(record)

    # Prepare the sale_records list
    sale_records = []

    for pg, doctors in grouped_data.items():
        for doctor, records in doctors.items():
            total_quantity = sum(int(record['quantity']) for record in records)
            total_revenue = sum(int(record['quantity']) * float(record['unit_price']) for record in records)
            sale_records.append({
                'product_group': pg,
                'doctorsname': doctor,
                'quantity': total_quantity,
                'revenue': total_revenue,
                'records': records
            })

    response = {
        'statusCode': 200,
        'body': json.dumps({
            'Records': sale_records,
            'CurrentMonthQuantity': monthly_totals['CurrentMonth']['quantity'],
            'CurrentMonthRevenue': monthly_totals['CurrentMonth']['revenue'],
            'PreviousMonthQuantity': monthly_totals['PreviousMonth']['quantity'],
            'PreviousMonthRevenue': monthly_totals['PreviousMonth']['revenue']
        }, default=str)
    }
    
    return response


```

---


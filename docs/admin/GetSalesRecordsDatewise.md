# Get Sales Records Datewise

### API Overview
- **Resource Name:** `getsales_records_datewise`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/getsales_records_datewise`
- **Lambda Function:** `getsales_records_datewise`

---


### Lambda Function
```python
import boto3
import json
from collections import defaultdict
from datetime import datetime, timedelta

def get_week_start_end():
    now = datetime.now()
    start_date = now - timedelta(days=now.weekday())  # Start of the current week (Monday)
    end_date = start_date + timedelta(days=7)  # End of the current week (Sunday)
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
    
    # Get the current week start and end dates
    current_week_start, current_week_end = get_week_start_end()
    
    # Group items by product_group and date, and calculate daily sales quantity and revenue
    grouped_data = defaultdict(lambda: defaultdict(list))
    weekly_totals = {
        'CurrentWeek': {'quantity': 0, 'revenue': 0.0}
    }
    
    for item in items:
        pg = item.get('product_group', 'Unknown')  # Default to 'Unknown' if product_group is missing
        timestamp = item.get('timestamp', '')
        
        quantity = int(item.get('quantity', 0))  # Ensure quantity is an integer
        unit_price = float(item.get('unit_price', 0.0))  # Ensure unit_price is a float
        revenue = quantity * unit_price  # Calculate revenue
        
        record = {
            "product_group": pg,
            "quantity": quantity,
            "unit_price": unit_price,
            "timestamp": timestamp,
            # Add other fields as necessary
        }
        
        # Parse the record's date
        if timestamp:
            try:
                record_date = datetime.fromisoformat(timestamp)
            except ValueError:
                continue  # Skip records with invalid date formats
            
            if current_week_start <= record_date < current_week_end:
                date_str = record_date.strftime('%Y-%m-%d')
                weekly_totals['CurrentWeek']['quantity'] += quantity
                weekly_totals['CurrentWeek']['revenue'] += revenue
                grouped_data[pg][date_str].append(record)
    
    # Prepare the sale_records list
    sale_records = []
    
    for pg, dates in grouped_data.items():
        for date, records in dates.items():
            total_quantity = sum(int(record['quantity']) for record in records)
            total_revenue = sum(int(record['quantity']) * float(record['unit_price']) for record in records)
            sale_records.append({
                'product_group': pg,
                'date': date,
                'quantity': total_quantity,
                'revenue': total_revenue,
                'records': records
            })
    
    response = {
        'statusCode': 200,
        'body': json.dumps({
            'Records': sale_records,
            'CurrentWeekQuantity': weekly_totals['CurrentWeek']['quantity'],
            'CurrentWeekRevenue': weekly_totals['CurrentWeek']['revenue']
        }, default=str)
    }
    
    return response


```


---

## IAM Policy for the Lambda Function

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:Scan",
                "dynamodb:Query",
                "dynamodb:GetItem"
            ],
            "Resource": "arn:aws:dynamodb:<region>:<account-id>:table/Avana"
        },
        {
            "Effect": "Allow",
            "Action": "logs:CreateLogGroup",
            "Resource": "arn:aws:logs:<region>:<account-id>:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:<region>:<account-id>:log-group:/aws/lambda/*"
        }
    ]
}

```
---


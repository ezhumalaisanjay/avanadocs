# Product Based Sales Records

## API Overview
- **Resource Name:** `product_based_get_Salerecords`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/product_based_get_Salerecords`
- **Lambda Function:** `product_based_get_Salerecords`



## **Lambda Function**
```python
import boto3
import json
import logging
from collections import defaultdict
from datetime import datetime, timedelta

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def get_month_start_end(year, month):
    start_date = datetime(year, month, 1)
    end_date = datetime(year + 1, 1, 1) if month == 12 else datetime(year, month + 1, 1)
    return start_date, end_date

def lambda_handler(event, context):
    try:
        dynamodb_table_name = 'Avana'
        category = event['category']
        userid = event['UserId']
        tracking_status_default = event['tracking_status']
        product_group = event.get('product_group', '')
        
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
            items.extend(response.get('Items', []))
            
            last_evaluated_key = response.get('LastEvaluatedKey')
            if not last_evaluated_key:
                break
        
        items.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        now = datetime.now()
        current_year, current_month = now.year, now.month
        previous_year, previous_month = (current_year - 1, 12) if current_month == 1 else (current_year, current_month - 1)
        
        current_month_start, current_month_end = get_month_start_end(current_year, current_month)
        previous_month_start, previous_month_end = get_month_start_end(previous_year, previous_month)
        
        product_groups = defaultdict(list)
        current_month_quantity, current_month_revenue = 0, 0.0
        previous_month_quantity, previous_month_revenue = 0, 0.0

        for item in items:
            pg = item.get('product_group', 'Unknown')
            if pg == product_group or not product_group:
                try:
                    record_date = datetime.fromisoformat(item.get("timestamp", ""))
                except ValueError:
                    continue
                
                if current_month_start <= record_date < current_month_end:
                    current_month_quantity += int(item.get("quantity", 0))
                    current_month_revenue += float(item.get("unit_price", 0.0)) * int(item.get("quantity", 0))
                elif previous_month_start <= record_date < previous_month_end:
                    previous_month_quantity += int(item.get("quantity", 0))
                    previous_month_revenue += float(item.get("unit_price", 0.0)) * int(item.get("quantity", 0))
                
                product_groups[pg].append(item)
        
        sale_records = [record for records in product_groups.values() for record in records]

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
        
        logger.info("Lambda executed successfully")
        return response
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal Server Error', 'error': str(e)})
        }
```

---

## **IAM Policy for Lambda Execution Role**

Attach this policy to the Lambda execution role to allow access to DynamoDB and CloudWatch.

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
            "Resource": "arn:aws:dynamodb:us-west-2:YOUR_AWS_ACCOUNT_ID:table/Avana"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-west-2:YOUR_AWS_ACCOUNT_ID:*"
        }
    ]
}
```

Replace `YOUR_AWS_ACCOUNT_ID` with your actual AWS account ID.

---
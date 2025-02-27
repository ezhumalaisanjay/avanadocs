# Get Distributor Sale Record

### API Overview
- **Resource Name:** `get_sfic_distbuter_Sale_records`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/get_sfic_distbuter_Sale_records`
- **Lambda Function:** `get_sfic_distbuter_Sale_records`

---


### Lambda Function
```python
import json
import re
import boto3
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    distributor_names = event.get('distributor_names', [])
    category = event.get('category', '')
    start_date = event.get('start_date', '')
    end_date = event.get('end_date', '')

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
        total_quantity = 0  # Total quantity count

        matching_records = []
        last_evaluated_key = None

        while True:
            # Query DynamoDB based on category and date range
            query_params = {
                'KeyConditionExpression': boto3.dynamodb.conditions.Key('category').eq(category),
                'FilterExpression': boto3.dynamodb.conditions.Key('distributor_name').eq(distributor_name) & 
                                    boto3.dynamodb.conditions.Attr('dates').between(start_date, end_date)
            }

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
            # Extract quantity and unit price
            quantity_str = record.get('quantity', '0')
            unit_price_str = record.get('unitprice', '0')
            tracking_status = record.get('tracking_status', '')
            record_date = record.get('dates', '')

            # Parse quantity as integer
            quantity_match = re.search(r'\d+', quantity_str)
            if quantity_match:
                quantity = int(quantity_match.group())
                total_quantity += quantity

                # Ensure the record falls within the specified date range
                if start_date <= record_date <= end_date:
                    # Calculate revenue for this record
                    unit_price = float(unit_price_str)
                    revenue = quantity * unit_price
                    total_revenue += revenue

                    # If the tracking status is Sale, increment total_sale_count
                    if tracking_status == 'Sale':
                        total_sale_count += quantity

        # Update entire counts
        entire_total_count += total_quantity
        entire_sale_count += total_sale_count
        entire_revenue_count += total_revenue

        # Only add distributor if there are matching records in the specified date range
        if matching_records:
            # Add distributor_name, counts, total revenue, and matching records to the response data
            response_data.append({
                'distributor_name': distributor_name,
                'Total_Count': total_quantity,
                'Sale_Count': total_sale_count,
                'Total_Revenue': total_revenue,
                'Matching_Records': matching_records
            })

    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Lambda function executed successfully!',
            'response_data': response_data,
            'entire_total_count': entire_total_count,
            'entire_sale_count': entire_sale_count,
            'entire_revenue_count': entire_revenue_count
        })
    }


```

---


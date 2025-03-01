# Get Distributors Record Count

### API Overview
- **Resource Name:** `get_all_distributor_records_Count`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/get_all_distributor_records_Count`
- **Lambda Function:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/get_all_distributor_records_Count`

---


### Lambda Function
```python
import boto3
import json
import re

def lambda_handler(event, context):
    # Get the category from the event parameter
    category = event.get('category', '')

    # Create DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'YourDynamoDBTableName' with your actual table name

    # Initialize an empty list to store all items
    all_items = []

    # Partition key of your DynamoDB table
    partition_key = "category"

    # Pagination loop
    last_evaluated_key = None
    while True:
        # Query records from DynamoDB
        query_params = {
            'KeyConditionExpression': boto3.dynamodb.conditions.Key(partition_key).eq(category),
        }
        if last_evaluated_key:
            query_params['ExclusiveStartKey'] = last_evaluated_key
        response = table.query(**query_params)

        # Append items from the current response to the list
        all_items.extend(response['Items'])

        # Update last evaluated key for pagination
        last_evaluated_key = response.get('LastEvaluatedKey')

        # Break the loop if there are no more items
        if not last_evaluated_key:
            break

    # Initialize a dictionary to store the aggregated information
    aggregated_info = {}

    # Initialize total quantity count
    entire_quantity_count = 0

    # Loop through all records and aggregate distributor-wise information
    for record in all_items:
        distributor_name = record.get('distributor_name')
        tracking_status = record.get('tracking_status', '')

        # Extract numeric part of quantity and convert to integer
        quantity_str = record.get('quantity', '0')
        quantity_match = re.search(r'\d+', quantity_str)
        quantity = int(quantity_match.group()) if quantity_match else 0

        # Initialize counts for the distributor if not present in the dictionary
        if distributor_name not in aggregated_info:
            aggregated_info[distributor_name] = {
                "distributor_name": distributor_name,
                "total_records_count": 0,
                "sales_count": 0,
                # "matching_records": 0,  # Initialize matching_records count for each distributor
                "revenue": 0,  # Initialize revenue for each distributor
                "records": []  # Initialize a list to store matching records for each distributor
            }

        # Increment total quantity count
        entire_quantity_count += quantity

        # Update counts based on tracking_status
        aggregated_info[distributor_name]["total_records_count"] += quantity
        if tracking_status == "Sale":
            aggregated_info[distributor_name]["sales_count"] += quantity

        # Check if the record has non-empty quantity and either unitprice or unit_price
        if quantity and ('unitprice' in record or 'unit_price' in record):
            # Use unitprice for revenue calculation if available, otherwise use unit_price
            if 'unitprice' in record:
                try:
                    revenue = float(quantity) * float(record['unitprice'])
                except ValueError:
                    revenue = 0
            else:
                try:
                    revenue = float(quantity) * float(record['unit_price'])
                except ValueError:
                    revenue = 0
        else:
            revenue = 0  # If quantity or unitprice/unit_price is missing, set revenue to 0

        # Update revenue for the distributor
        aggregated_info[distributor_name]["revenue"] += revenue

        # Add the record to matching_records and increment the count
        aggregated_info[distributor_name]["records"].append(record)
        # aggregated_info[distributor_name]["matching_records"] += 1

    # Calculate overall counts and revenue
    entire_total_count = sum(info["total_records_count"] for info in aggregated_info.values())
    entire_sale_count = sum(info["sales_count"] for info in aggregated_info.values())
    entire_revenue_count = sum(info["revenue"] for info in aggregated_info.values())

    # Transform aggregated_info dictionary into a list for the desired response format
    response_data = list(aggregated_info.values())

    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Lambda function executed successfully!', 
            'response_data': response_data,
            'entire_total_count': entire_total_count,
            'entire_sale_count': entire_sale_count,
            'entire_revenue_count': entire_revenue_count,
            'entire_quantity_count': entire_quantity_count  # Including total quantity count in the response
        })
    }


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
                "dynamodb:Query",
                "dynamodb:Scan"
            ],
            "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/Avana"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-east-1:123456789012:*"
        }
    ]
}


```
---

# Sales Report Distributor Wise Date Filter

:::note
This documentation provides details about the `Sales_report_Distributor_wise_date_filter` API, which retrieves sales data for a given **distributor**, **category**, and **date range**.
:::

## Overview

**API Name:** Sales_report_Distributor_wise_date_filter  
**Invoke URL:** https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Sales_report_Distributor_wise_date_filter  
**Lambda Function Name:** Sales_report_Distributor_wise_date_filter  
**Method**: PUT  

## Lambda Function

```python
import boto3
import json

def lambda_handler(event, context):
    # Replace 'your-dynamodb-table-name' with the actual name of your DynamoDB table
    dynamodb_table_name = 'Avana'
    category = event['category']  # This is the partition key (category) value
    status = event.get('tracking_status')  # Assuming you pass the 'team' attribute in the event
    group_title = event.get('group_title')
    user_id = event.get('UserId')
    distributor_name = event.get('distributor_name')  # Add distributor_name
    start_date = event.get('start_date')  # Add start_date
    end_date = event.get('end_date')  # Add end_date

    # Create the DynamoDB resource
    dynamodb = boto3.resource('dynamodb')

    # Get the DynamoDB table
    table = dynamodb.Table(dynamodb_table_name)

    # Define the filter expression
    filter_expression = (
        "tracking_status = :val_status AND distributor_name = :val_distributor_name AND "
        "group_title = :val_group_title AND dates BETWEEN :val_start_date AND :val_end_date "
        "OR (tracking_status = :val_status AND distributor_name = :val_distributor_name AND "
        "UserId = :val_user_id AND dates BETWEEN :val_start_date AND :val_end_date)"
    )

    # Define the expression attribute values
    expression_attribute_values = {
        ':val_status': status,
        ':val_group_title': group_title,
        ':val_user_id': user_id,
        ':val_distributor_name': distributor_name,
        ':val_start_date': start_date,
        ':val_end_date': end_date
    }

    items = []
    last_evaluated_key = None

    while True:
        # Query the DynamoDB table
        query_params = {
            'KeyConditionExpression': 'category = :category',
            'FilterExpression': filter_expression,
            'ExpressionAttributeValues': {
                ':category': category,
                **expression_attribute_values
            }
        }

        if last_evaluated_key:
            query_params['ExclusiveStartKey'] = last_evaluated_key

        response = table.query(**query_params)

        # Get the items from the response
        items.extend(response.get('Items', []))

        # Set LastEvaluatedKey for pagination
        last_evaluated_key = response.get('LastEvaluatedKey')

        if not last_evaluated_key:
            break  # Break the loop if there are no more items to fetch

    # Sort the items by the 'dates' attribute in descending order
    sorted_items = sorted(items, key=lambda x: x.get('dates', ''), reverse=True)

    return {
        'statusCode': 200,
        'body': json.dumps({'items': sorted_items}, default=str)
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
                "dynamodb:Query"
            ],
            "Resource": [
                "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Avana"
            ]
        }
    ]
}

```
---

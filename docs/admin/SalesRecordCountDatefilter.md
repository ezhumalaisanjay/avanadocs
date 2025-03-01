# Sales Record Count with Date Filter

:::note
This documentation provides details about the `sales_record_count_datefilter` API, which retrieves aggregated sales and lead data based on **distributor** names, **category**, and **date range** filters.
:::

## Overview

**Resource Name:** sales_record_count_datefilter  
**Invoke URL:** https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_record_count_datefilter  
**Lambda Function Name:** sales_record_count_datefilter  
**Method**: PUT  
## Lambda Function

```python
import boto3
import re

def lambda_handler(event, context):
    distributor_names = event.get('distributor_names', [])
    category = event.get('category', '')
    start_date = event.get('start_date')
    end_date = event.get('end_date')

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'Avana' with your actual table name

    aggregated_info = {}
    last_evaluated_key = None

    while True:
        if distributor_names:
            for distributor_name in distributor_names:
                scan_params = {
                    "FilterExpression": "distributor_name = :distributor_name AND category = :category AND #dates BETWEEN :start_date AND :end_date",
                    "ExpressionAttributeNames": {"#dates": "dates"},
                    "ExpressionAttributeValues": {
                        ":distributor_name": distributor_name,
                        ":category": category,
                        ":start_date": start_date,
                        ":end_date": end_date
                    }
                }
                if last_evaluated_key:
                    scan_params['ExclusiveStartKey'] = last_evaluated_key

                response = table.scan(**scan_params)
                last_evaluated_key = response.get('LastEvaluatedKey')
                process_response(response, distributor_name, aggregated_info)
        else:
            scan_params = {
                "FilterExpression": "#dates BETWEEN :start_date AND :end_date",
                "ExpressionAttributeNames": {"#dates": "dates"},
                "ExpressionAttributeValues": {
                    ":start_date": start_date,
                    ":end_date": end_date
                }
            }
            if last_evaluated_key:
                scan_params['ExclusiveStartKey'] = last_evaluated_key

            response = table.scan(**scan_params)
            last_evaluated_key = response.get('LastEvaluatedKey')
            process_response_with_category(response, aggregated_info, start_date, end_date)

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
# Sales Tracking - Individual Sale Status Records

:::note
This documentation provides details about the `Avana_get_individual_sale_status_records` API, which retrieves individual sale status records based on **UserId**, **category**, and **tracking_status**.
:::

## Overview

**API Name:** sales_tracking  
**Sub API Name:** Avana_get_individual_sale_status_records  
**Invoke URL:** https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking/Avana_get_individual_sale_status_records  
**Lambda Function Name:** Avana_get_individual_sale_status_records  
**Method:** PUT  

## Lambda Function

```python
import boto3
import json

def lambda_handler(event, context):
    dynamodb_table_name = 'Avana'
    category = event['category']
    userid = event['UserId']
    tracking_status_default = event['tracking_status']
    
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(dynamodb_table_name)
    
    filter_expression = 'UserId = :val'
    expression_attribute_values = {
        ':val': userid,
        ':tracking_status': tracking_status_default
    }
    
    items = []
    last_evaluated_key = None
    
    while True:
        query_params = {
            'KeyConditionExpression': 'category = :category',
            'FilterExpression': f'{filter_expression} AND tracking_status = :tracking_status',
            'ExpressionAttributeValues': {
                ':category': category,
                **expression_attribute_values
            },
            'ScanIndexForward': False  # This ensures descending order by default
        }
        
        if last_evaluated_key:
            query_params['ExclusiveStartKey'] = last_evaluated_key
        
        response = table.query(**query_params)
        queried_items = response.get('Items', [])
        
        items.extend(queried_items)
        
        last_evaluated_key = response.get('LastEvaluatedKey')
        if not last_evaluated_key:
            break
    
    # Sort items based on the 'dates' attribute in descending order
    sorted_items = sorted(items, key=lambda x: x.get('dates', ''), reverse=True)
    
    return {
        'statusCode': 200,
        'body': json.dumps(sorted_items, default=str)
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

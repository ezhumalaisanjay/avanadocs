# Sales Tracking - Create Multiple Sales

:::note
This documentation provides details about the `sales_tracking` API and its sub-API `Avana_create_multiple_sales`, which allows for batch insertion of sales records into the **Avana** DynamoDB table.
:::

## Overview

**API Name:** sales_tracking  
**Sub API Name:** Avana_create_multiple_sales  
**Invoke URL:** https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking/Avana_create_multiple_sales  
**Lambda Function Name:** Avana_create_multiple_sales  
**Method**: POST  

## Lambda Function

```python
import json
import boto3
from datetime import datetime

client = boto3.resource("dynamodb")
table = client.Table("Avana")

def lambda_handler(event, context):
    response_list = []

    for record in event:
        record["timestamp"] = datetime.now().isoformat(timespec='microseconds')
        
        # Insert each record into DynamoDB
        table.put_item(Item=record)
        
        response_list.append({
            'statusCode': 200,
            'body': json.dumps(record, default=str)
        })

    return response_list
```

# Get All Distributor Sales Track

:::note
This documentation provides details about the `sales_tracking` API, specifically the `/get_all_distributor_sales_track` endpoint, which retrieves sales tracking data for distributors based on **category** and **group**.
:::

## Overview

**API Name:** sales_tracking  
**Sub API Name:** /get_all_distributor_sales_track  
**Method:** PUT  
**Lambda Function Name:** Avana_Create_sales_order_invntory  
**Invoke URL:** [`https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking/get_all_distributor_sales_track`](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking/get_all_distributor_sales_track)  

## Lambda Function

```python
import boto3
import json

def lambda_handler(event, context):
    # Replace 'your-dynamodb-table-name' with the actual name of your DynamoDB table
    dynamodb_table_name = 'Avana'
    category = event['category']  # This is the partition key (category) value
    group = event['group']
    distributor_name = event.get('distributor_name')  # Add distributor_name

    print(category)
    print(group)
    print(distributor_name)

    # Create the DynamoDB resource
    dynamodb = boto3.resource('dynamodb')

    # Get the DynamoDB table
    table = dynamodb.Table(dynamodb_table_name)
    print(table)

    # Define the filter expression with 'group_title' and 'distributor_name' attributes
    filter_expression = 'group_title = :val AND distributor_name = :dist_name'

    # Define the expression attribute values
    expression_attribute_values = {
        ':val': group,
        ':dist_name': distributor_name
    }

    # Query the DynamoDB table
    response = table.query(
        KeyConditionExpression='category = :category',
        FilterExpression=filter_expression,
        ExpressionAttributeValues={
            ':category': category,
            **expression_attribute_values
        }
    )
    print(response)

    # Get the items from the response
    items = response.get('Items', [])
    print(items)

    return {
        'statusCode': 200,
        'body': json.dumps(items, default=str)
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
            "Resource": "arn:aws:dynamodb:us-west-2:YOUR_AWS_ACCOUNT_ID:table/Avana"
        }
    ]
}


```
---
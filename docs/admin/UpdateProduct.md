# Update Product

### API Overview
- **Resource Name:** `update_product`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/update_product`
- **Lambda Function:** `Update_missed_product_group`

---


### Lambda Function
```python
import json
import boto3

def lambda_handler(event, context):
    # Set your DynamoDB table name
    table_name = 'Avana'

    # Set the attribute name for the partition key
    partition_key_attribute = "sales tracking"

    # Set the attribute name for the filter expression
    product_group_attribute = 'product_group'

    # Create a DynamoDB resource
    dynamodb = boto3.resource('dynamodb')

    # Get the DynamoDB table
    table = dynamodb.Table(table_name)

    # Define the scan parameters with filter expression
    scan_params = {
        'FilterExpression': f'attribute_not_exists({product_group_attribute})'
    }

    # Perform the scan operation
    response = table.scan(**scan_params)

    # Get the items from the response
    dynamodb_response = response.get('Items', [])
    
    print(dynamodb_response)

    # If there are more items to scan, continue scanning
    while 'LastEvaluatedKey' in response:
        response = table.scan(**scan_params, ExclusiveStartKey=response['LastEvaluatedKey'])
        dynamodb_response.extend(response.get('Items', []))

    # Retrieve json_list from the Lambda event
    json_list = event

    # Initialize an empty list to store results
    results = []

    # Iterate through each item in the JSON list
    for item in json_list:
        group_id = item.get('group_id')

        # Check if the group_id matches with DynamoDB response product_name
        matching_item = next((dynamo_item for dynamo_item in dynamodb_response if dynamo_item.get('product_name') == group_id), None)

        if matching_item:
            # If there is a match, add the group_name to the results
            results.append({
                'group_id': group_id,
                'group_name': item.get('group_name')
            })

    # Print or return the results as needed
    print("Results:", results)

    # If you want to return the results, you can use the following
    return {
        'statusCode': 200,
        'body': json.dumps(results)
    }


```

---


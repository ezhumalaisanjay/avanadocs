# Get Purchase Order Report

## Overview
This API allows you to fetch the count of purchase orders from a DynamoDB table based on the distributor name, category, and tracking status. The Lambda function scans the `Avana` table for matching records and returns the count of records per distributor.

## Endpoint

- **Resource** : `distributorcount`
- **Sub Resource** : `Get_Purchase_order_report`
- **URL** : `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/distributorcount/Get_Purchase_order_report`
- **Method:** : `PUT`

## Request

### Body Parameters

The request body should be a JSON object with the following parameters:

- **distributor_names**: A list of distributor names for which you want to retrieve the purchase order count.
- **category**: The category of the purchase order.
- **tracking_status**: The tracking status of the purchase order.

Example request body:

```json
{
  "distributor_names": ["Distributor1", "Distributor2"],
  "category": "Electronics",
  "tracking_status": "Shipped"
}
```

## Response

### Success (200 OK)

If the request is processed successfully, the response will contain the status code 200 and a body with the following fields:

- **message**: A message indicating the successful execution of the Lambda function.
- **matching_records**: A list of dictionaries, each containing:
  - `distributor_name`: The name of the distributor.
  - `count`: The number of matching purchase orders for that distributor.

Example success response:

```json
{
  "statusCode": 200,
  "body": {
    "message": "Lambda function executed successfully!",
    "matching_records": [
      {"distributor_name": "Distributor1", "count": 15},
      {"distributor_name": "Distributor2", "count": 10}
    ]
  }
}
```

### Error (500 Internal Server Error)

If there is an error during the execution, the response will contain the status code 500 and a body with an error message.

Example error response:

```json
{
  "statusCode": 500,
  "body": {
    "message": "Internal Server Error"
  }
}
```

## Lambda Function

### Code:

```python
import boto3
import json

def lambda_handler(event, context):
    try:
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('Avana')  # Replace 'Avana' with your actual table name

        distributor_names = event.get('distributor_names', [])
        category = event.get('category')
        tracking_status = event.get('tracking_status')

        result = []

        for distributor_name in distributor_names:
            # Scan DynamoDB table with a filter for the specific distributor
            response = table.scan(
                FilterExpression='category = :cat AND tracking_status = :status AND distributor_name = :distributor',
                ExpressionAttributeValues={
                    ':cat': category,
                    ':status': tracking_status,
                    ':distributor': distributor_name
                }
            )

            # Get the count of items for the specific distributor
            count = response['Count']

            # Create a dictionary for the current distributor's count
            distributor_count = {'distributor_name': distributor_name, 'count': count}

            # Append the result to the list
            result.append(distributor_count)

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Lambda function executed successfully!', 'matching_records': result})
        }

    except Exception as e:
        # Log any exception and return an error response
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal Server Error'})
        }
```

## Notes

- Ensure that the `Avana` table in DynamoDB contains the following fields:
  - `category`: The category of the purchase order.
  - `tracking_status`: The tracking status of the purchase order.
  - `distributor_name`: The name of the distributor.

- The function uses the `scan` operation on the DynamoDB table to filter records based on the provided `category`, `tracking_status`, and `distributor_name`.

- Make sure the API Gateway is properly configured to forward the PUT request to the Lambda function.

## Error Handling

In case of errors, the Lambda function will return a 500 status code with an error message. Common errors include:

- Missing or invalid parameters.
- DynamoDB scan failures or permission issues.
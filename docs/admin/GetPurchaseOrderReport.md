# Get Purchase Order Report

## Overview
- **Resource** : `distributorcount`
- **Sub Resource** : `Get_Purchase_order_report`
- **URL** : `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/distributorcount/Get_Purchase_order_report`
- **Method:** : `PUT`
---

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
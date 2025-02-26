# Distributor Get Count

### API Information
- **Resource Name:** `distributorcount`
- **Method:** `PUT`
- **API URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/distributorcount`
- **Lambda Function Name:** `getdistributorcount`

### Lambda Function: `getdistributorcount`

```python
import boto3

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'Avana' with your actual table name

    category = event.get('category')  # Get category from input event
    tracking_status = event.get('tracking_status')  # Get tracking status from input event

    # Scan DynamoDB table without using an index
    response = table.scan(
        FilterExpression='category = :cat AND tracking_status = :status',
        ExpressionAttributeValues={
            ':cat': category,
            ':status': tracking_status
        }
    )

    # Extract distributor names from the response and count occurrences
    items = response['Items']
    distributor_count = {}
    for item in items:
        distributor_name = item.get('distributor_name')
        if distributor_name:
            distributor_count[distributor_name] = distributor_count.get(distributor_name, 0) + 1

    # Convert distributor_count dictionary to a list of dictionaries
    result = [{'distributor_name': name, 'count': count} for name, count in distributor_count.items()]

    return result
```

### Request Parameters
| Parameter        | Type   | Required | Description          |
|------------------|--------|----------|----------------------|
| `category`       | String | Yes      | The category to filter records. |
| `tracking_status`| String | Yes      | The tracking status to filter records. |

### Sample Request Body
```json
{
  "category": "Medical",
  "tracking_status": "Sale"
}
```

### Response
| Field             | Type   | Description                          |
|-------------------|--------|--------------------------------------|
| `distributor_name`| String | Name of the distributor.             |
| `count`           | Number | Count of records for the distributor.|

### Sample Response
```json
[
  {
    "distributor_name": "Distributor A",
    "count": 5
  },
  {
    "distributor_name": "Distributor B",
    "count": 3
  }
]
```

### Error Handling
- `400 Bad Request` if required parameters are missing.
- `500 Internal Server Error` for any unexpected server-side issues.


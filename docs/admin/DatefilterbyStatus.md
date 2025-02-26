# Date Filter By Status

## Overview
**Resource Name:** `date_filter_by_status_distributor_record`  
**HTTP Method:** `PUT`  
**API URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/date_filter_by_status_distributor_record`  

## Description
This API retrieves filtered records from the DynamoDB table `Avana` based on distributor names, tracking status, date range, and doctor names. The results are sorted by the `dates` field in descending order.

---

## Request
### Headers
```http
Content-Type: application/json
```

### Request Body
| Parameter         | Type       | Required | Description                          |
|------------------|------------|----------|--------------------------------------|
| `category`        | `string`   | Yes      | The partition key for the DynamoDB table. |
| `tracking_status` | `string`   | Yes      | Status of the tracking record.       |
| `distributor_name`| `array`    | Yes      | List of distributor names to filter by. |
| `start_date`      | `string`   | No       | Start date for the date range filter (format: `YYYY-MM-DD`). |
| `end_date`        | `string`   | No       | End date for the date range filter (format: `YYYY-MM-DD`). |
| `doctorsname`     | `string`   | No       | Name of the doctor to filter by.     |

### Example Request
```json
{
  "category": "Medical",
  "tracking_status": "Shipped",
  "distributor_name": ["DistributorA", "DistributorB"],
  "start_date": "2023-08-01",
  "end_date": "2023-08-31",
  "doctorsname": "Dr. Smith"
}
```

---

## Response
### Success Response
**Status Code:** `200 OK`

| Field            | Type     | Description                |
|------------------|----------|----------------------------|
| `category`       | `string` | The category of the record. |
| `tracking_status`| `string` | Status of the tracking.     |
| `distributor_name`| `string`| Name of the distributor.   |
| `dates`          | `string` | Date associated with the record. |
| `doctorsname`    | `string` | Name of the doctor.        |

**Example Response:**
```json
[
  {
    "category": "Medical",
    "tracking_status": "Shipped",
    "distributor_name": "DistributorA",
    "dates": "2023-08-15",
    "doctorsname": "Dr. Smith"
  },
  {
    "category": "Medical",
    "tracking_status": "Shipped",
    "distributor_name": "DistributorB",
    "dates": "2023-08-10",
    "doctorsname": "Dr. Smith"
  }
]
```

### Error Response
**Status Code:** `400 Bad Request`

**Example Response:**
```json
{
  "error": "Category or tracking status is missing in the event data."
}
```

---

## Lambda Function Overview
```python
import boto3
from boto3.dynamodb.conditions import Key, Attr
import json
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return str(o)
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')

    result = []
    last_evaluated_key = None
    
    distributor_names = event['distributor_name']
    category = event['category']
    tracking_status = event['tracking_status']
    start_date = event.get('start_date')
    end_date = event.get('end_date')
    doctorsname = event.get('doctorsname')

    if category and tracking_status:
        for distributor_name in distributor_names:
            while True:
                filter_expression = (Attr('distributor_name').eq(distributor_name) &
                                     Attr('tracking_status').eq(tracking_status))
                
                if start_date and end_date:
                    filter_expression &= Attr('dates').between(start_date, end_date)
                
                if doctorsname:
                    filter_expression &= Attr('doctorsname').eq(doctorsname)
                
                query_params = {
                    'KeyConditionExpression': Key('category').eq(category),
                    'FilterExpression': filter_expression
                }
                
                if last_evaluated_key:
                    query_params['ExclusiveStartKey'] = last_evaluated_key
                
                response = table.query(**query_params)
                result.extend(response['Items'])
                
                last_evaluated_key = response.get('LastEvaluatedKey')
                
                if not last_evaluated_key:
                    break
    else:
        print("Category or tracking status is missing in the event data.")
    
    sorted_result = sorted(result, key=lambda x: x.get('dates', ''), reverse=True)
    
    return json.dumps(sorted_result, cls=DecimalEncoder)
```

---

## Notes
- Ensure the `Avana` table exists and has a partition key of `category`.
- Results are sorted by the `dates` field in descending order.
- Fields like `start_date`, `end_date`, and `doctorsname` are optional filters.
- Handles pagination through `LastEvaluatedKey` for large data sets.


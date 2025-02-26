# Distributor Wise Date Range Application Report

### Resource Information
- **Resource Name:** `Distributor_wise_date_range_application_report`
- **Method:** `PUT`
- **API URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Distributor_wise_date_range_application_report`
- **Lambda Function Name:** `Distributor_wise_date_range_application_report`

---

### Description
This API fetches application records from the `Avana` DynamoDB table based on a distributor name and a specified date range. The results are sorted by date in descending order.

---

### Request Parameters
| Parameter         | Type   | Required | Description                     |
|------------------|--------|----------|---------------------------------|
| `category`        | String | Yes      | Category of the application     |
| `distributor_name`| String | Yes      | Distributor's name              |
| `start_date`      | String | Yes      | Start date in `YYYY-MM-DD` format |
| `end_date`        | String | Yes      | End date in `YYYY-MM-DD` format   |

---

### Sample Request Body
```json
{
  "category": "Electronics",
  "distributor_name": "ABC Distributors",
  "start_date": "2023-08-01",
  "end_date": "2023-08-31"
}
```

---

### Response
| Field      | Type    | Description                    |
|------------|---------|--------------------------------|
| `statusCode` | Integer | HTTP status code                |
| `body`      | String  | JSON string of sorted records   |

---

### Sample Response
```json
{
  "statusCode": 200,
  "body": "[
    {
      \"category\": \"Electronics\",
      \"distributor_name\": \"ABC Distributors\",
      \"dates\": \"2023-08-15\",
      \"order_id\": \"12345\"
    },
    {
      \"category\": \"Electronics\",
      \"distributor_name\": \"ABC Distributors\",
      \"dates\": \"2023-08-10\",
      \"order_id\": \"67890\"
    }
  ]"
}
```

---

### Error Responses
**400 Bad Request:**
```json
{
  "statusCode": 400,
  "body": "Invalid input parameters"
}
```

**500 Internal Server Error:**
```json
{
  "statusCode": 500,
  "body": "An error occurred while processing the request"
}
```

---

### Lambda Function
```python
import boto3
import json
from boto3.dynamodb.conditions import Key, Attr
from datetime import datetime

def lambda_handler(event, context):
    dynamodb_table_name = "Avana"
    category = event['category']
    distributor_name = event['distributor_name']
    start_date = event['start_date']
    end_date = event['end_date']

    start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
    end_datetime = datetime.strptime(end_date, "%Y-%m-%d")

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(dynamodb_table_name)

    items = []
    last_evaluated_key = None

    while True:
        query_params = {
            'KeyConditionExpression': Key('category').eq(category),
            'FilterExpression': (Key('distributor_name').eq(distributor_name) &
                                 Attr('dates').between(start_datetime.strftime("%Y-%m-%d"), end_datetime.strftime("%Y-%m-%d"))),
            'ScanIndexForward': False
        }

        if last_evaluated_key:
            query_params['ExclusiveStartKey'] = last_evaluated_key

        response = table.query(**query_params)
        queried_items = response.get('Items', [])
        items.extend(queried_items)

        last_evaluated_key = response.get('LastEvaluatedKey')
        if not last_evaluated_key:
            break

    sorted_items = sorted(items, key=lambda x: x.get('dates', ''), reverse=True)
    response_json = json.dumps(sorted_items)

    return {
        'statusCode': 200,
        'body': response_json
    }
```

---


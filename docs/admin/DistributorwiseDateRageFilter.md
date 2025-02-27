# Distributor Wise Date Range Application Report

### Resource Information
- **Resource Name:** `Distributor_wise_date_range_application_report`
- **Method:** `PUT`
- **API URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Distributor_wise_date_range_application_report`
- **Lambda Function Name:** `Distributor_wise_date_range_application_report`


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


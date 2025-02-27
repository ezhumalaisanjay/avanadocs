# Get Distributor Data

### API Overview
- **Resource Name:** `get_distributor_data `
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/get_distributor_data`
- **Lambda Function:** `getdistributordata`

---


### Lambda Function
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
    table = dynamodb.Table('Avana')  # Replace 'your_table_name' with your actual table name

    result = []
    last_evaluated_key = None
    
    for record in event:
        category = record['category']
        distributor_name = record['distributor_name']
        
        while True:
            query_params = {
                'KeyConditionExpression': Key('category').eq(category),
                'FilterExpression': Attr('distributor_name').eq(distributor_name)
            }
            if last_evaluated_key:
                query_params['ExclusiveStartKey'] = last_evaluated_key
            
            response = table.query(**query_params)
            result.extend(response['Items'])
            
            last_evaluated_key = response.get('LastEvaluatedKey')
            
            if not last_evaluated_key:
                break
    
    # Sort the result by descending order of dates
    sorted_result = sorted(result, key=lambda x: x.get('dates', ''), reverse=True)
    
    return json.dumps(sorted_result, cls=DecimalEncoder)


```

---


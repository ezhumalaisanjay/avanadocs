# Filter User Records Status Date Range

### API Overview
- **Resource Name:** `Filter_specific_user_records_status_date_range`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Filter_specific_user_records_status_date_range`
- **Lambda Function:** `Filter_specific_user_records_status_date_range`

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')
    
    # Define filter expression
    filter_expression = "UserId = :user_id AND dates BETWEEN :start_date AND :end_date AND tracking_status = :status"
    
    # Define expression attribute values
    expression_attribute_values = {
        ':user_id': event['UserId'],
        ':start_date': event['start_date'],
        ':end_date': event['end_date'],
        ':status': event['tracking_status']
    }
    
    # Perform the query
    response = table.query(
        KeyConditionExpression="category = :category",  # KeyConditionExpression for the partition key
        FilterExpression=filter_expression,
        ExpressionAttributeValues={**expression_attribute_values, ':category': event['category']},
        ScanIndexForward=False  # Sort in descending order
    )
    
    # Get the LastEvaluatedKey for pagination
    last_evaluated_key = response.get('LastEvaluatedKey')
    
    # Sort the items based on dates attribute in descending order
    sorted_items = sorted(response['Items'], key=lambda x: x['dates'], reverse=True)
    
    # Convert response to JSON format
    response_json = json.dumps({
        'items': sorted_items,
        'last_evaluated_key': last_evaluated_key
    })
    
    return {
        'statusCode': 200,
        'body': response_json
    }


```

---


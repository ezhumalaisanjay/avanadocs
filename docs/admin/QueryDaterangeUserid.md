# Query Daterange Userid

### API Overview
- **Resource Name:** `query_daterange_userid`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/query_daterange_userid`
- **Lambda Function:** `Query_daterange_user_based`

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    try:
        # Initialize DynamoDB client
        dynamodb = boto3.client('dynamodb')
        
        # List to store retrieved records
        records = []
        last_evaluated_key = None
        
        # Iterate through each user in the event
        for user_data in event:
            user_id = user_data['UserId']
            start_date = user_data.get('start_date')  # Get start_date if exists
            end_date = user_data.get('end_date')  # Get end_date if exists
            distributor_name = user_data.get('distributor_name')  # Get distributor_name if exists
            doctors_name = user_data.get('doctorsname')
            
            # Define category value
            category_val = user_data.get('category')
            
            # Define filter expression based on event attributes
            filter_expression = '#UserId = :user_id'
            expression_attribute_names = {'#UserId': 'UserId'}
            expression_attribute_values = {':user_id': {'S': user_id}}
            
            # Add category_val to expression_attribute_values if it exists
            if category_val:
                expression_attribute_values[':category_val'] = {'S': category_val}
            
            # Add start_date and end_date to filter expression if they exist
            if start_date and end_date:
                filter_expression += ' AND #dates BETWEEN :start_date AND :end_date'
                expression_attribute_names['#dates'] = 'dates'
                expression_attribute_values[':start_date'] = {'S': start_date}
                expression_attribute_values[':end_date'] = {'S': end_date}
            
            # Add distributor_name to filter expression if it exists
            if distributor_name:
                filter_expression += ' AND #distributor_name = :distributor_name'
                expression_attribute_names['#distributor_name'] = 'distributor_name'
                expression_attribute_values[':distributor_name'] = {'S': distributor_name}
            
            # Add doctorsname to filter expression if it exists
            if doctors_name:
                filter_expression += ' AND #doctorsname = :doctorsname'
                expression_attribute_names['#doctorsname'] = 'doctorsname'
                expression_attribute_values[':doctorsname'] = {'S': doctors_name}
            
            while True:
                # Define query_params dictionary
                query_params = {
                    'TableName': 'Avana',
                    'KeyConditionExpression': 'category = :category_val',  # Directly include category value
                    'FilterExpression': filter_expression,
                    'ExpressionAttributeNames': expression_attribute_names,
                    'ExpressionAttributeValues': expression_attribute_values
                }
                
                # Add last evaluated key to the query if present
                if last_evaluated_key:
                    query_params['ExclusiveStartKey'] = last_evaluated_key
                
                # Query DynamoDB
                response = dynamodb.query(**query_params)
                
                # Add retrieved records to the list and convert attribute values to strings
                for item in response['Items']:
                    for key, value in item.items():
                        if isinstance(value, dict) and 'S' in value:
                            item[key] = value['S']
                    records.append(item)
                
                # Update last evaluated key for pagination
                last_evaluated_key = response.get('LastEvaluatedKey')
                
                # Break the loop if there are no more items
                if not last_evaluated_key:
                    break
        
        # Sort records by dates attribute in descending order
        sorted_records = sorted(records, key=lambda x: x['dates'], reverse=True)
        
        # Return the sorted records as JSON
        return json.dumps(sorted_records)
    
    except Exception as e:
        return {
            "errorMessage": str(e),
            "errorType": type(e).__name__
        }


```

---


# Multi Filter Records

### API Overview
- **Resource Name:** `Multi_filter_records`
- **Sub Resource Name:** `Multi_filter_records`
- **Method:** ``
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Multi_filter_records`
- **Lambda Function:** ``

---


### Lambda Function
```python
import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
from functools import reduce  # Import reduce from functools

def lambda_handler(event, context):
    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    
    # Define table name
    table_name = 'Avana'
    
    # Define partition key attribute
    partition_key = 'category'
    
    # Define key to sort by
    sort_key = 'dates'  # Replace 'dates' with the actual key
    
    # Get the category from the event input
    category = event['category']
    
    # Initialize filter expressions
    filter_expressions = [Key(partition_key).eq(category)]
    
    # Check if distributor_name is provided in the event
    if 'distributor_name' in event:
        filter_expressions.append(Attr('distributor_name').eq(event['distributor_name']))
    
    # Check if product_code is provided in the event
    if 'product_group' in event:
        filter_expressions.append(Attr('product_group').eq(event['product_group']))
        
    if 'doctorsname' in event:
        filter_expressions.append(Attr('doctorsname').eq(event['doctorsname']))
    
    # Check if start_date and end_date are provided in the event
    if 'start_date' in event and 'end_date' in event:
        filter_expressions.append(Attr('dates').between(event['start_date'], event['end_date']))
    
    # Check if tracking_status is provided in the event
    if 'tracking_status' in event:
        filter_expressions.append(Attr('tracking_status').eq(event['tracking_status']))
    
    # Check if group_title is provided in the event and if it's not empty
    if 'group_title' in event and event['group_title']:
        filter_expressions.append(Attr('group_title').eq(event['group_title']))
    else:
        # If group_title is empty, add condition to check if it exists
        filter_expressions.append(Attr('group_title').exists())

    
    # Get the DynamoDB table object
    table = dynamodb.Table(table_name)
    
    # Initialize an empty list to store all items
    all_items = []
    
    # Pagination loop
    last_evaluated_key = None
    while True:
        # Query records from DynamoDB with filtering
        query_params = {
            'KeyConditionExpression': filter_expressions[0],
            'FilterExpression': reduce(lambda x, y: x & y, filter_expressions[1:]) if len(filter_expressions) > 1 else None
        }
        if last_evaluated_key:
            query_params['ExclusiveStartKey'] = last_evaluated_key
        response = table.query(**query_params)
        
        # Append items from the current response to the list
        all_items.extend(response['Items'])
        
        # Update last evaluated key for pagination
        last_evaluated_key = response.get('LastEvaluatedKey')
        
        # Break the loop if there are no more items
        if not last_evaluated_key:
            break
    
    # Sort all items based on the specified key with handling for None values
    sorted_response = sorted(all_items, key=lambda x: x.get(sort_key, ''), reverse=True)
    
    # Count the total number of items in the response
    total_count = len(sorted_response)
    
    # Create a dictionary containing the count and sorted items
    result = {
        'totalCount': total_count,
        'items': sorted_response
    }

    # Return the result as JSON
    return json.dumps(result)


```


---

## IAM Policy for the Lambda Function

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:Query"
            ],
            "Resource": "arn:aws:dynamodb:us-west-2:<account-id>:table/Avana"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-west-2:<account-id>:log-group:/aws/lambda/*"
        }
    ]
}

```
---

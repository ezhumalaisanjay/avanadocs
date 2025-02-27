# Work Check Travel Plan

### API Overview
- **Resource Name:** `work`
- **Sub Resource Name:** `check_travel_plan`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/work/check_travel_plan`
- **Lambda Function:** `Query_date_range`

---


### Lambda Function
```python
import boto3

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table_name = 'Avana'  # Replace with your DynamoDB table name
    table = dynamodb.Table(table_name)
    
    
    # Get the category, dates, Place_of_Work, and UserId from the event
    category = "Travel Plans"
    dates = event.get('Dates')  # List of dates to filter
    place_of_work = event.get('City')
    user_id = event.get('UserId')
    
    # Scan the DynamoDB table and apply the filter expression
    response = table.scan(
        FilterExpression='category = :category AND dates = :dates AND Place_of_Work = :place_of_work AND UserId = :user_id',
        ExpressionAttributeValues={
            ':category': category,
            ':dates': dates,
            ':place_of_work': place_of_work,
            ':user_id': user_id,
        }
    )
    print(response)
    
    # Filter the scan results based on the date, Place_of_Work, and UserId attributes
    items = response.get('Items', [])
    
    return {
        'statusCode': 200,
        'body': items
    }

```

---


# Distributor Get Count

### API Information
- **Resource Name:** `distributorcount`
- **Method:** `PUT`
- **invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/distributorcount`
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

---

## IAM Policy for the Lambda Function

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "dynamodb:Scan",
            "Resource": "arn:aws:dynamodb:us-west-2:YOUR_AWS_ACCOUNT_ID:table/Avana"
        }
    ]
}







```
---
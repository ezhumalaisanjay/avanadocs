# Get All Profiles

### API Overview
- **Resource Name:** `Get_all_profiles`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Get_all_profiles`
- **Lambda Function:** `Get_all_profiles`

---


### Lambda Function
```python
import json
import boto3

def lambda_handler(event, context):
    # Define DynamoDB table and filter criteria
    table_name = 'Avana'
    filter_attribute = 'profile'
    filter_values = ['Internal', 'External']  # List of values to filter

    # Create DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)

    # Scan DynamoDB table with filter
    response = table.scan(
        FilterExpression=f'#{filter_attribute} IN ({",".join([":value" + str(i) for i in range(len(filter_values))])})',
        ExpressionAttributeNames={'#profile': filter_attribute},
        ExpressionAttributeValues={f':value{i}': filter_values[i] for i in range(len(filter_values))}
    )

    # Process scan results
    items = response['Items']
    print(f"Found {len(items)} item(s) with '{filter_attribute}' in {filter_values}")

    # Construct event JSON
    event_json = {
        'profile': filter_values
    }
    print("Event JSON:", json.dumps(event_json))

    # Return response (this can be customized based on your needs)
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Scan successful',
            'items': items
        })
    }


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
                "dynamodb:Scan"
            ],
            "Resource": "arn:aws:dynamodb:us-west-2:YOUR_AWS_ACCOUNT_ID:table/Avana"
        }
    ]
}

```
---


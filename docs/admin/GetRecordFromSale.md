# Get Record From Sales

### API Overview
- **Resource Name:** `getsaficrecordfromsale`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/Get_distributor_name_wise_record/getsaficrecordfromsale`
- **Lambda Function:** `get_sfaicrecordget`

---


### Lambda Function
```python
import boto3

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Avana')  # Replace 'Avana' with your actual table name

    distributor_names = event.get('distributor_names', [])
    category = event.get('category')
    tracking_status = event.get('tracking_status')

    result = []

    for distributor_name in distributor_names:
        # Scan DynamoDB table with a filter for the specific distributor
        response = table.scan(
            FilterExpression='category = :cat AND tracking_status = :status AND distributor_name = :distributor',
            ExpressionAttributeValues={
                ':cat': category,
                ':status': tracking_status,
                ':distributor': distributor_name
            }
        )

        # Get the count of items for the specific distributor
        count = response['Count']

        # Create a dictionary for the current distributor's count
        distributor_count = {'distributor_name': distributor_name, 'count': count}

        # Append the result to the list
        result.append(distributor_count)

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
            "Action": [
                "dynamodb:Scan"
            ],
            "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/Avana"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-east-1:123456789012:*"
        }
    ]
}

```
---


# Add New Team

This AWS Lambda function updates the `team` attribute in a DynamoDB table named `Avana`. It processes a list of users from the incoming event and conditionally updates or creates the `team` attribute.

## API Gateway Endpoint

**Invoke URL:**  
[`https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/add_new_team`](https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/add_new_team)

**Resource ID:** `3d4c1c`  
**ARN:** `arn:aws:execute-api:us-west-2:600087091387:xqaizmksl2/*/PUT/add_new_team`  

## AWS Services Used

- **API Gateway:** Handles HTTP requests and invokes the Lambda function.
- **AWS Lambda:** Executes the function to update the DynamoDB table.
- **Amazon DynamoDB:** Stores team-related data.

## Function Code

```python
import json
import boto3

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table_name = 'Avana'  # Replace with your DynamoDB table name

    for user in event['Users']:
        category = user.get('category')
        timestamp = user.get('timestamp')
        team = event['team']

        # Update the DynamoDB record and conditionally create the 'team' attribute
        table = dynamodb.Table(table_name)
        response = table.update_item(
            Key={
                'category': category,
                'timestamp': timestamp
            },
            UpdateExpression="SET #team = if_not_exists(#team, :team)",
            ExpressionAttributeNames={
                '#team': 'team'
            },
            ExpressionAttributeValues={
                ':team': team
            },
            ReturnValues="UPDATED_NEW"
        )

        print(f"Updated item for category: {category}, timestamp: {timestamp}, team: {team}")

    return {
        'statusCode': 200,
        'body': json.dumps('Records updated successfully')
    }
```

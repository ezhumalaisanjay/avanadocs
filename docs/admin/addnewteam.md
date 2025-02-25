

# AWS Lambda Function: `add_new_team`

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
Request Payload Example
json
Copy
Edit
{
    "Users": [
        {
            "category": "Engineering",
            "timestamp": "2025-02-25T10:00:00Z"
        },
        {
            "category": "HR",
            "timestamp": "2025-02-25T11:00:00Z"
        }
    ],
    "team": "Team Alpha"
}
Response Example
json
Copy
Edit
{
    "statusCode": 200,
    "body": "\"Records updated successfully\""
}
Error Handling
Missing Fields: Ensure that Users array and team field are included in the request payload.
DynamoDB Issues: Verify the table Avana exists and has appropriate permissions for Lambda.
IAM Permissions Required
The Lambda function requires the following IAM policy to access DynamoDB:

json
Copy
Edit
{
    "Effect": "Allow",
    "Action": [
        "dynamodb:UpdateItem"
    ],
    "Resource": "arn:aws:dynamodb:us-west-2:600087091387:table/Avana"
}
Deployment Steps
Deploy the Lambda function using AWS Console or AWS CLI.
Configure API Gateway to trigger this function on PUT /add_new_team.
Test the API using Postman, cURL, or AWS API Gateway test feature.

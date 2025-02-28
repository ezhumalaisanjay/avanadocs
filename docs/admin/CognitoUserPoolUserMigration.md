# AWS Cognito User Pool and User Migration

## 1. Create a User Pool in AWS Cognito Service

### Authentication / Sign-up

#### Page: Sign-up

**Attribute Verification and User Account Confirmation:**
- **Attributes to Verify:**
  - Send email message, verify email address

**Required Attributes:**
- `phone_number`
- `email`
- `name`

**Custom Attributes:**
- `custom:distributor_name` / String
- `custom:UserID` / String

---

### Authentication / Sign-in

#### Page: Sign-in

**User Account Recovery:**
- **Self-service Account Recovery:** Enabled

---

## 2. User Management / Groups

### Page: Groups

- Create all Groups with same name mentioned below:

**Groups:**
- Admin
- Avana_Employee
- Distributor
- Distributor_Admin
- Manager
- National_Sales_Manager

---

## 3. Overview

### Page: Overview

**User Pool Information:**
- **User Pool ID:** Copy the User Pool ID and use it wherever needed.

---

## 4. Create an S3 Bucket

Create an S3 bucket in the **same region** where you created the Cognito user pool.

### Tab: Permissions

#### Section: Bucket Policy

Replace this policy and change the bucket name in the policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:ListBucket",
                "s3:AbortMultipartUpload",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::yourbucketname",
                "arn:aws:s3:::yourbucketname/*"
            ]
        }
    ]
}
```

#### Section: Block Public Access (Bucket Settings)

- **Block all public access:** Off

**Notes:**
- We have uploaded the JSON files with all users' information against the Cognito user pool.
- Get the files from the GitHub repository:
  - Clone the repository
  - [GitHub Repository](https://github.com/practice-work-cloud/Avana.git)
  - File Name: `Cognito_userpool_users.zip`
- Create a folder in your S3 bucket and upload the file to the created folder.

---

## 5. Create a Lambda Function

Create a Lambda function in the **same region** where you created the Cognito user pool.

### Basic Information

- **Function Name:** Your own function name
- **Choose Runtime:** Python 3.13

### Execution Role

- **Change default execution role:**
  - Create a new role with basic Lambda permissions

- **Click:** `Create Function` button

### Code Source

Copy the following Python function into the code source:

```python
import boto3
import json
from datetime import datetime

s3 = boto3.client('s3')
client = boto3.client('cognito-idp')
ses_client = boto3.client('ses')

bucket_name = 'bucket_name'
prefix = 'folder_name/'
user_pool_id = "user_pool_id"

def datetime_converter(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError("Type not serializable")

def get_attribute_value(user, attribute_name):
    try:
        return next(attr['Value'] for attr in user['Attributes'] if attr['Name'] == attribute_name)
    except StopIteration:
        return None

def create_user_in_cognito(username, sub_value, group_name, password, email, user):
    try:
        user_attributes = [{'Name': 'custom:UserID', 'Value': sub_value}]
        for attr in user['Attributes']:
            if attr['Name'] not in ('sub', 'custom:UserID'):
                user_attributes.append(attr)

        client.admin_create_user(
            UserPoolId=user_pool_id,
            Username=username,
            UserAttributes=user_attributes,
            TemporaryPassword=password,
            MessageAction='SUPPRESS',
            DesiredDeliveryMediums=['EMAIL']
        )

        client.admin_add_user_to_group(
            UserPoolId=user_pool_id,
            Username=username,
            GroupName=group_name
        )

        client.admin_set_user_password(
            UserPoolId=user_pool_id,
            Username=username,
            Password=password,
            Permanent=True
        )

        email_subject = "Welcome to Avana CRM"
        email_body = f"""
        <html>
        <body>
            <h2>Welcome, {username.capitalize()}</h2>
            <p>Your account has been created. Here are your credentials:</p>
            <p><strong>Username:</strong> {username}</p>
            <p><strong>Password:</strong> {password}</p>
            <a href='https://avanasurgical.com/crm/'>Login to Avana CRM</a>
        </body>
        </html>
        """

        response = ses_client.send_email(
            Source="SES Verified Email ID",
            Destination={'ToAddresses': [email]},
            Message={'Subject': {'Data': email_subject}, 'Body': {'Html': {'Data': email_body}}}
        )

        print(f"Email sent to {email} successfully: {response['MessageId']}")

    except client.exceptions.UsernameExistsException:
        print(f"User {username} already exists")
    except Exception as e:
        print(f"Error creating user {username}: {str(e)}")

def lambda_handler(event, context):
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
    if 'Contents' in response:
        for obj in response['Contents']:
            file_key = obj['Key']
            if file_key.endswith('.json'):
                file_content = s3.get_object(Bucket=bucket_name, Key=file_key)
                users_data = json.loads(file_content['Body'].read().decode('utf-8'))['body']
                group_name = users_data['groupName']

                for user in users_data[group_name]:
                    username = user['Username']
                    password = f"{username.capitalize()}@2025"
                    sub_value = get_attribute_value(user, 'sub')
                    email = get_attribute_value(user, 'email')

                    if sub_value and email:
                        create_user_in_cognito(username, sub_value, group_name, password, email, user)

    return {
        'statusCode': 200,
        'body': json.dumps('Users created, added to group, and email sent successfully')
    }
```

**Replace the following values:**
- `bucket_name = ''` — Your bucket name
- `prefix = '/'` — Your folder name
- `user_pool_id = ''` — Your Cognito user pool ID

**In the `send_email` function:**
- Replace `Source` with your SES-verified admin email ID

---

## 6. Configuration

### General Configuration

- **Edit Timeout:** Set timeout to 15 minutes and save

---

## 7. Permissions

### Execution Role

- Click on the role name to navigate to the IAM role

### Permissions

- Click the `Add permissions` dropdown button
- Attach the following policies:
  - `s3:ListBucket`
  - `s3:GetObject`
  - `cognito-idp:AdminCreateUser`
  - `cognito-idp:AdminAddUserToGroup`
  - `cognito-idp:AdminSetUserPassword`
  - `ses:SendEmail`
  - `logs:CreateLogGroup`

## 8. Test Lambda Function

- Configure a Test event as it is.
And click on Test to execute the Lambda function.
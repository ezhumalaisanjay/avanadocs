# AWS DynamoDB Import from S3 Bucket Guide

## Repository Information
- **GitHub Repository:** [Avana GitHub Repository](https://github.com/practice-work-cloud/Avana.git)

## Cloning the Repository
1. Clone the above GitHub repository to download the files:

```bash
git clone https://github.com/practice-work-cloud/Avana.git
```

2. Extract the `AWSDynamoDB.zip` file.
3. Upload the extracted files to an S3 bucket in your AWS account.

---

## Setting Up IAM Permissions

Go to the S3 bucket where you uploaded the exported DynamoDB file and set up the bucket policy.

> **Note:** Replace `your-bucket` with your actual S3 bucket name.

### S3 Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowDynamoDBImportAction",
      "Effect": "Allow",
      "Action": [
        "dynamodb:ImportTable",
        "dynamodb:DescribeImport"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:111122223333:table/my-table*"
    },
    {
      "Sid": "AllowS3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket/*",
        "arn:aws:s3:::your-bucket"
      ]
    },
    {
      "Sid": "AllowCloudwatchAccess",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:PutLogEvents",
        "logs:PutRetentionPolicy"
      ],
      "Resource": "arn:aws:logs:us-east-1:111122223333:log-group:/aws-dynamodb/*"
    },
    {
      "Sid": "AllowDynamoDBListImports",
      "Effect": "Allow",
      "Action": "dynamodb:ListImports",
      "Resource": "*"
    }
  ]
}
```

---

## Importing Data Using the AWS Management Console

This section demonstrates how to use the DynamoDB console to import existing data to a new table.

> **Note:** Ensure the DynamoDB table is created in the same AWS region where your other services (API Gateway, Lambda, Cognito User Pool) are located.

### Steps to Import Data

1. Sign in to the AWS Management Console and open the [DynamoDB console](https://console.aws.amazon.com/dynamodb/).
2. In the navigation pane, choose **Import from S3**.
3. On the page that appears, select **Import from S3**.
4. Choose **Import from S3** again.
5. In **Source S3 URL**, enter the Amazon S3 source URL.
   - If you own the source bucket, choose **Browse S3** to search for it.
   - Alternatively, enter the bucket's URL in this format: `s3://bucket/prefix`.
6. Specify if you are the S3 bucket owner.
7. Under **Import file compression**, choose the appropriate option: `No compression`, `GZIP`, or `ZSTD`.
8. Select the appropriate **Import file format**.
9. Click **Next** and select the options for the new table that will store your data.

### Table Configuration

- **Table Name:** `Avana`
- **Partition Key:** `category`
- **Sort Key:** `timestamp`

> **Important:** The primary key and sort key must match the attributes in the file. Attribute names are case-sensitive.

10. Click **Next** again to review your import options.
11. Click **Import** to begin the import task.
    - The table will initially show the status **"Creating"** and won’t be accessible.
12. Once the import completes, the table status will change to **"Active"**, and you can start using it.

---

## Viewing Past Import Details

You can view information about past import tasks:

1. Go to the **Import from S3** section in the navigation sidebar.
2. Select the **Imports** tab.
3. The import panel will list all imports from the past 90 days.
4. Click the ARN of any listed task to view detailed information, including advanced configuration settings.
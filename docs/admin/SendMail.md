# Send Mail

### API Overview
- **Resource Name:** `send_mail_po`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/send_mail_po`
- **Lambda Function:** `send_mail_po`

---


### Lambda Function
```python
import json
import boto3

def lambda_handler(event, context):
    # Initialize the SES client
    ses = boto3.client('ses')

    # Retrieve purchase order details from the event
    purchase_order = event['purchase_order']
    
    # Extract details for the email
    order_id = purchase_order['order_id']
    customer_name = purchase_order['customer_name']
    order_date = purchase_order['order_date']
    crate_user = purchase_order['Crate_user']
    amount = purchase_order['Amount']
    recipient_emails = purchase_order['recipient_emails']

    # Construct the email content
    subject = f"New Purchase Order: {order_id}"
    body_text = f"Hello,\n\nA new purchase order has been created.\n\nPurchase Order: {order_id}\nCustomer Name: {customer_name}\nPurchase Order Date: {order_date}\nCreated by: {crate_user}\nAmount: {amount}\n\nThank you."
    
    # Send the email
    response = ses.send_email(
        Source="rohan@avanasurgical.com",  # Specify the sender email address here
        Destination={
            'ToAddresses': recipient_emails,
        },
        Message={
            'Subject': {
                'Data': subject,
                'Charset': 'UTF-8'
            },
            'Body': {
                'Text': {
                    'Data': body_text,
                    'Charset': 'UTF-8'
                }
            }
        }
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps('Email sent successfully!')
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
                "ses:SendEmail"
            ],
            "Resource": [
                "arn:aws:ses:REGION:ACCOUNT_ID:identity/rohan@avanasurgical.com"
            ]
        }
    ]
}

```
---


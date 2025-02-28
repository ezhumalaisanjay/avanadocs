# 

### API Overview
- **Resource Name:** `sales_tracking`
- **Sub Resource Name:** `sales_trcking_update`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/sales_tracking/sales_trcking_update`
- **Lambda Function:** `Avana_sales_trcking_update`

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    # TODO implement
    print(event)
    client = boto3.resource("dynamodb")
    table = client.Table("Avana")
    response1 = table.update_item(
        Key={
            'category': event['category'],
            'timestamp': event['timestamp']
        },
        UpdateExpression="set patientname=:patientname, unit_price=:unit_price, product_id=:product_id, product_group=:product_group,  patientemail=:patientemail, patientnumber=:patientnumber, quantity=:quantity, dates=:dates, doctorsname=:doctorsname, tracking_status=:tracking_status, product_name=:product_name, product_code=:product_code, nickname=:nickname",
        ExpressionAttributeValues={
            ':patientname': event['patientname'],
            ':patientnumber': event['patientnumber'],
            ':patientemail': event['patientemail'],
            ':quantity': event['quantity'],
            ':dates': event['dates'],
            ':doctorsname': event['doctorsname'],
            ':tracking_status': event['tracking_status'],
            ':product_name': event['product_name'],
            ':product_code': event['product_code'],
            ':product_id': event['product_id'],
            ':product_group': event['product_group'],
            ':unit_price': event['unit_price'],
            ':nickname': event['nickname']  # Include the new attribute
        }
    )
    return {
        "statusCode": 200,  # You can customize the status code
        "body": json.dumps(event),
    }


```

---


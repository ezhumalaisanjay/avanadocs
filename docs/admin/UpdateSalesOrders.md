# Update Sales Orders

### API Overview
- **Resource Name:** `update_sales_orders`
- **Method:** `PUT`
- **Invoke URL:** `https://xqaizmksl2.execute-api.us-west-2.amazonaws.com/test/update_sales_orders`
- **Lambda Function:** `Update_Sales_Orders`

---


### Lambda Function
```python
import boto3
import json

def lambda_handler(event, context):
    if not isinstance(event, list):
        return "Event is not a list of records to update"

    client = boto3.resource("dynamodb")
    table = client.Table("Avana")

    results = []

    for record in event:
        if "category" not in record or "timestamp" not in record or "sales_order_status" not in record:
            results.append("Required fields missing in one of the records")
        else:
            category = record["category"]
            timestamp = record["timestamp"]
            sales_order_status = record["sales_order_status"]

            # UpdateExpression to set the 'sales_order_status' to the provided value
            update_expression = "set sales_order_status = :sales_status"

            # Expression attribute values
            expression_attribute_values = {
                ':sales_status': sales_order_status
            }

            try:
                # Update the specified record
                table.update_item(
                    Key={
                        'category': category,
                        'timestamp': timestamp
                    },
                    UpdateExpression=update_expression,
                    ExpressionAttributeValues=expression_attribute_values
                )
                results.append(f"Updated record with category: {category}, timestamp: {timestamp}, and sales_order_status set to: {sales_order_status}")
            except Exception as e:
                results.append(f"Error updating the record: {str(e)}")

    return results


```

---


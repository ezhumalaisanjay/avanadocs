## AWS API Gateway and Lambda Setup Guide

### Prerequisites
- AWS Account Access
- API Files with:
  - Resource Name
  - Sub-resource Name
  - HTTP Method
  - Lambda Function Code
  - IAM Role Policy

---

### 1. Create AWS Lambda Function
1. Go to **AWS Lambda Console**.
2. Click **Create function**.
3. Choose **Author from scratch**.
4. Enter a **Function name**.
5. Select **Python 3.x** as the runtime.
6. Choose an appropriate **Execution role**:
   - Select **Create a new role with basic Lambda permissions** (if a new role is needed).
7. Click **Create function**.
8. Under **Code Source**, replace the existing code with the **Lambda function code** from the API file.
9. Click **Deploy**.

---

### 2. Configure Lambda Function
1. Go to the **Configuration** tab.
2. Under **General configuration**, click **Edit**.
3. Set **Timeout** to **3 minutes (3m 0s)**.
4. Click **Save**.

---

### 3. Attach IAM Role Policy
1. Under **Configuration**, go to **Permissions**.
2. Click the **Role name** linked under the **Execution role**.
3. In the **IAM Console**, go to **Permissions**.
4. Click **Add permissions** > **Attach policies**.
5. Choose the **Policy** provided in the API file or create a custom policy if specified.
6. Click **Attach policy**.

---

### 4. Create REST API in API Gateway
1. Go to **API Gateway Console**.
2. Click **Create API**.
3. Choose **REST API** and select **Build**.
4. Choose **New API**.
5. Provide **API Name**, **Description**, and select **Regional**.
6. Click **Create API**.

---

### 5. Set Resource and Sub-resource
1. In the API Gateway console, select your API.
2. Under **Resources**, click **Actions** > **Create Resource**.
3. Enter **Resource Name** and **Resource Path** from the API file.
4. Click **Create Resource**.
5. If there’s a sub-resource, select the parent resource and repeat the steps to add the sub-resource.

---

### 6. Set HTTP Method and Integration
1. Select the **Resource/Sub-resource** you just created.
2. Click **Actions** > **Create Method**.
3. Choose the HTTP method (e.g., **GET**, **POST**) from the API file.
4. Click the **checkmark**.
5. Choose **Lambda Function** as the **Integration type**.
6. Enter the **Lambda Function name**.
7. Click **Save**.
8. Confirm permissions when prompted.

---

### 7. Enable CORS
1. Select the **Resource/Sub-resource**.
2. Click **Actions** > **Enable CORS**.
3. Select the **Methods** you created.
4. Click **Enable CORS and replace existing CORS headers**.
5. Confirm and **Save**.

---

### 8. Deploy API
1. Click **Actions** > **Deploy API**.
2. Choose an **Existing deployment stage** or click **[New Stage]**.
3. Enter a **Stage Name** (Set as , **test**).
4. Click **Deploy**.
5. Note the **Invoke URL** provided.

---

### 9. Repeat for All API Files
Repeat steps 1-8 for each API file, using the corresponding resource name, sub-resource name, method, Lambda function, and IAM policy.

---

### 10. Additional Notes
- Ensure each Lambda function has the necessary permissions to interact with other AWS services.
- Double-check CORS settings if API calls fail from front-end applications.
- Update IAM roles carefully to avoid over-permissioning.

---


### Notes on Installing Additional Packages for AWS Lambda

- If your Lambda function requires packages that are not included by default in AWS Lambda, you can install them locally on your development machine.
- After installing the required packages, place both the Lambda function file and the installed packages in the same directory.
- Zip the entire directory (including the Lambda function and the packages).
- Upload the zipped file to AWS Lambda to deploy the function with the necessary dependencies.

This approach allows your Lambda function to access all required libraries during execution.


**End of Document**
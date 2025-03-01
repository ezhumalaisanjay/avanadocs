# Create an Identity Pool for Your Cognito User Pool

Follow these simple steps to create an identity pool for your user pool in AWS Cognito.

## Step 1: Sign in to the AWS Management Console
- Go to the [AWS Management Console](https://aws.amazon.com/console/).
- Sign in with your AWS account credentials.

## Step 2: Open the Amazon Cognito Console
- In the AWS Management Console, search for **Cognito** in the search bar and select **Amazon Cognito**.

## Step 3: Create a New Identity Pool
1. In the left sidebar, under **Federated Identities**, click on **Manage Identity Pools**.
2. Click on the **Create new identity pool** button.
3. In the **Create identity pool** page:
   - Enter a name for your identity pool (e.g., "MyIdentityPool").
   - Check **Enable access to unauthenticated identities** if you want to allow unauthenticated access.
   - Under **Authentication providers**, select **Cognito**.
   - Enter your **User Pool ID** and **App Client ID** from the **User Pools** section of the Cognito dashboard.
4. Click **Create Pool**.

## Step 4: Set Up IAM Roles for Authenticated and Unauthenticated Users
- AWS will prompt you to create IAM roles for **Authenticated** and **Unauthenticated** users.
  - For **Authenticated users**, you can either use an existing role or create a new one.
  - For **Unauthenticated users**, AWS will create a role with default permissions (you can modify it later).
- Click **Allow** to let Cognito automatically create the roles.

## Step 5: Update Your App Client Settings (Optional)
1. Go to the **Cognito User Pool** dashboard.
2. Under **App Integration**, click on **App clients**.
3. Select the app client associated with your User Pool.
4. Make sure the **Cognito Identity Pool** is configured for your app.

## Step 6: Test Your Identity Pool
- Use the AWS SDK or AWS Amplify to authenticate users via the identity pool.
- Test to make sure users can sign in with your Cognito User Pool credentials and access AWS resources.

## Conclusion
You have successfully created an Identity Pool linked to your Cognito User Pool. You can now authenticate users and allow them to access AWS services securely.

For more detailed configuration and advanced features, refer to the official [AWS Cognito Identity Pools documentation](https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/Welcome.html).

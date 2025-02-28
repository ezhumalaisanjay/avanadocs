# Avana CRM Front end Update

## 1. Clone the Repository
```bash
git clone https://github.com/practice-work-cloud/Avana.git
```

## 2. Navigate to the CRM Folder
```bash
cd Avana/crm
```

## 3. Update AWS Cognito Configuration

**File Path:** `assets/js/config.js`

Replace the placeholders with your actual AWS Cognito user pool and identity pool information:

```javascript
window._config = {
    cognito: {
        userPoolId: '', // e.g. us-east-2_uXboG5pAb
        region: '', // e.g. us-east-2
        clientId: '', // is this used anywhere?
        IdentityPoolId: ''
    }
};
```

## 4. Update User ID Reference

In **all HTML files**, find this syntax:

```javascript
session.getIdToken().decodePayload()["sub"];
```

Replace it with:

```javascript
session.getIdToken().decodePayload()["custom:UserID"];
```

## 5. Update API Gateway ID

**API ID:** `xqaizmksl2`

Find the above API ID across all HTML files and replace it with the API Gateway API ID from your AWS account.

---

**Search and Replace Example:**

Find:
```javascript
https://xqaizmksl2.execute-api.<region>.amazonaws.com/<stage>
```

Replace with:
```javascript
https://<your-api-id>.execute-api.<your-region>.amazonaws.com/<stage>
```
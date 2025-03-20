# User Role Management and Groups

## User Roles and Access Control

This document outlines the various user roles and their respective permissions in the system.

### Groups and Access Permissions

| Role                     | Access Scope |
|--------------------------|------------------------------------------------|
| **Admin**               | Full access to all records and roles.         |
| **Avana_Employee**      | Can view data under the Distributor.          |
| **Distributor**         | Can view their own Distributor data.          |
| **Distributor_Admin**   | Can view Distributor data.                     |
| **Manager**            | Can view Avana_Employee, Distributor_Admin, and Distributor data. |
| **National_Sales_Manager** | Full access to all records and roles.        |

### Role Hierarchy

1. **Admin** and **National_Sales_Manager** have full access to all records.
2. **Manager** has access to Avana_Employee, Distributor_Admin, and Distributor data.
3. **Distributor_Admin** can view Distributor data.
4. **Distributor** can only see their own data.
5. **Avana_Employee** can view data under the Distributor.

This access control ensures a structured and secure management of user roles within the system.

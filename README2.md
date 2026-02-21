# MIS Dashboard Backend API Documentation

## Base URLs

- **Base URL**: `https://5hwtmvdt-3000.inc1.devtunnels.ms`
- **API Base URL**: `https://5hwtmvdt-3000.inc1.devtunnels.ms/api/v1`

---

## Table of Contents

1. [Authentication & Users](#authentication--users)
2. [Banks](#banks)
3. [Borrowers](#borrowers)
4. [Customers](#customers)
5. [Loan Applications](#loan-applications)
6. [Customer Assessments](#customer-assessments)
7. [Bank Questions](#bank-questions)
8. [Payment Ledgers](#payment-ledgers)
9. [Recovery Overdues](#recovery-overdues)
10. [Installments](#installments)
11. [Subscriptions](#subscriptions)
12. [Notifications](#notifications)

---

## Authentication & Users

### Super Admin Login
- **POST** `/api/v1/superadmin-login`
  - No authentication required

### Get All Users with Subscriptions (SuperAdmin only)
- **GET** `/api/v1/systemUser?search=&page=1&limit=10&role=`
  - Requires: Bank Token, SuperAdmin role

### Get Current User Data
- **GET** `/api/v1/me`
  - Requires: JWT Token (any authenticated user)

### Get User by ID
- **GET** `/api/v1/:userId`
  - Requires: Bank Token

---

## Banks

### Public Routes (No Authentication)

#### Bank Login
- **POST** `/api/v1/bankAdmin/banks/login`

#### Forgot Password - Send OTP
- **POST** `/api/v1/bankAdmin/banks/forgot-password`

#### Resend OTP
- **POST** `/api/v1/bankAdmin/banks/resend-otp`

#### Verify OTP
- **POST** `/api/v1/bankAdmin/banks/verify-otp`

#### Reset Password
- **POST** `/api/v1/bankAdmin/banks/reset-password`

#### Google Login
- **POST** `/api/v1/bankAdmin/banks/google-login`

### SuperAdmin Routes

#### Register Bank
- **POST** `/api/v1/superAdmin/banks/addBank`
  - Requires: Bank Token, SuperAdmin role

#### Get All Banks
- **GET** `/api/v1/superAdmin/banks/`
  - Requires: Bank Token, SuperAdmin role

#### Get Bank by ID
- **GET** `/api/v1/superAdmin/banks/:id`
  - Requires: Bank Token, SuperAdmin role

#### Change Bank Status
- **PUT** `/api/v1/superAdmin/banks/:id/status`
  - Requires: Bank Token, SuperAdmin role

#### Delete Bank
- **DELETE** `/api/v1/superAdmin/banks/:id`
  - Requires: Bank Token, SuperAdmin role

### Bank Admin Routes

#### Update Bank Info
- **PUT** `/api/v1/bankAdmin/banks/:id`
  - Requires: Bank Token, Active Bank Status

---

## Borrowers

All routes require: Bank Token, Admin role

#### Create Borrower
- **POST** `/api/v1/bankAdmin/borrowers`

#### Get All Borrowers
- **GET** `/api/v1/bankAdmin/borrowers`

#### Get Borrower by ID
- **GET** `/api/v1/bankAdmin/borrowers/:id`

#### Update Borrower
- **PUT** `/api/v1/bankAdmin/borrowers/:id`

#### Delete Borrower
- **DELETE** `/api/v1/bankAdmin/borrowers/:id`

---

## Customers

### Public Routes

#### Customer Registration
- **POST** `/api/customers/register`

#### Customer Login
- **POST** `/api/customers/login`

#### Forgot Password - Send OTP
- **POST** `/api/customers/forgot-password`

#### Resend OTP
- **POST** `/api/customers/resend-otp`

#### Verify OTP
- **POST** `/api/customers/verify-otp`

#### Reset Password
- **POST** `/api/customers/reset-password`

#### Google Login
- **POST** `/api/customers/google-login`

### Authenticated Routes

#### Update Customer Profile
- **PUT** `/api/customers/:id`
  - Requires: Bank Token, User role

---

## Loan Applications

### System User Routes

#### Create Loan Application
- **POST** `/api/v1/systemUser/loan-applications`
  - Requires: Bank Token, User role

### Bank Admin Routes

#### Get All Loan Applications
- **GET** `/api/v1/bankAdmin/loan-applications`
  - Requires: Bank Token, Admin role
  - Supports: Search and pagination

#### Get Loan Application by ID
- **GET** `/api/v1/bankAdmin/loan-applications/:id`
  - Requires: Bank Token, Admin role

#### Update Loan Application
- **PUT** `/api/v1/bankAdmin/loan-applications/:id`
  - Requires: Bank Token, Admin role

#### Delete Loan Application
- **DELETE** `/api/v1/bankAdmin/loan-applications/:id`
  - Requires: Bank Token, Admin role

---

## Customer Assessments

### Customer Routes (Customer Authentication)

#### Submit Assessment
- **POST** `/api/v1/systemUser/assessments/submit`
  - Requires: Customer Token

#### Get My Assessments
- **GET** `/api/v1/systemUser/assessments/my-assessments`
  - Requires: Customer Token

#### Get Assessment Results
- **GET** `/api/v1/systemUser/assessments/results/:assessmentId`
  - Requires: Customer Token

### Bank Routes (Bank Authentication)

#### Get Bank Assessments
- **GET** `/api/v1/bankAdmin/assessments`
  - Requires: Bank Token, Admin role

---

## Bank Questions

### Bank Admin Routes

#### Create or Update Bank Questions
- **POST** `/api/v1/bankAdmin/bank-questions`
  - Requires: Bank Token, Admin role

#### Get Bank Questions
- **GET** `/api/v1/bankAdmin/bank-questions`
  - Requires: Bank Token, Admin role

#### Toggle Bank Questions Status
- **PUT** `/api/v1/bankAdmin/bank-questions/toggle-status`
  - Requires: Bank Token, Admin role

#### Add Question
- **POST** `/api/v1/bankAdmin/bank-questions/add-question`
  - Requires: Bank Token, Admin role

#### Update Question
- **PUT** `/api/v1/bankAdmin/bank-questions/update-question/:questionIndex`
  - Requires: Bank Token, Admin role

#### Remove Question
- **DELETE** `/api/v1/bankAdmin/bank-questions/remove-question/:questionIndex`
  - Requires: Bank Token, Admin role

### Public Route

#### Get Bank Questions for Customer
- **GET** `/api/v1/bankAdmin/customer/:bankId`
  - No authentication required
  - Returns questions without correct answers

---

## Payment Ledgers

All routes require: Bank Token, Admin role

#### Create Payment Ledger
- **POST** `/api/v1/bankAdmin/payment-ledgers`

#### Get All Payment Ledgers
- **GET** `/api/v1/bankAdmin/payment-ledgers`
  - Supports: Search, pagination, and sorting

#### Get Payment Ledger by ID
- **GET** `/api/v1/bankAdmin/payment-ledgers/:id`

#### Update Payment Ledger
- **PUT** `/api/v1/bankAdmin/payment-ledgers/:id`

#### Delete Payment Ledger
- **DELETE** `/api/v1/bankAdmin/payment-ledgers/:id`

---

## Recovery Overdues

All routes require: Bank Token, Admin role

#### Create Recovery Overdue
- **POST** `/api/v1/bankAdmin/recovery-overdues`

#### Get All Recovery Overdues
- **GET** `/api/v1/bankAdmin/recovery-overdues`
  - Supports: Search, pagination, and sorting

#### Get Recovery Overdue by ID
- **GET** `/api/v1/bankAdmin/recovery-overdues/:id`

#### Update Recovery Overdue
- **PUT** `/api/v1/bankAdmin/recovery-overdues/:id`

#### Delete Recovery Overdue
- **DELETE** `/api/v1/bankAdmin/recovery-overdues/:id`

---

## Installments

#### Get Installments by Customer ID
- **GET** `/api/v1/bankAdmin/installments/:customerId`
  - Requires: Bank Token, Admin role

---

## Subscriptions

### Bank Admin Routes

#### Create Subscription
- **POST** `/api/v1/subscriptions`
  - Requires: Bank Token

### SuperAdmin Routes

#### Get All Subscriptions
- **GET** `/api/v1/superAdmin/subscriptions`
  - Requires: Bank Token, SuperAdmin role

#### Get Subscription by ID
- **GET** `/api/v1/superAdmin/subscriptions/:id`
  - Requires: Bank Token, SuperAdmin role

#### Update Subscription
- **PUT** `/api/v1/superAdmin/subscriptions/:id`
  - Requires: Bank Token, SuperAdmin role

#### Delete Subscription
- **DELETE** `/api/v1/superAdmin/subscriptions/:id`
  - Requires: Bank Token, SuperAdmin role

---

## Notifications

All routes require: Bank Token

#### Get All Notifications for User
- **GET** `/api/v1/notifications/user/:userId`

#### Get Unread Count for User
- **GET** `/api/v1/notifications/user/:userId/unread-count`

#### Get Notification by ID
- **GET** `/api/v1/notifications/:notificationId`

#### Mark Notification as Read
- **PUT** `/api/v1/notifications/:notificationId/read`

#### Mark All Notifications as Read
- **PUT** `/api/v1/notifications/user/:userId/read-all`

#### Delete Notification
- **DELETE** `/api/v1/notifications/:notificationId`

#### Delete All Notifications for User
- **DELETE** `/api/v1/notifications/user/:userId/delete-all`

---

## Authentication Notes

- **Bank Token**: JWT token for bank/admin/superadmin users
- **Customer Token**: JWT token for customer users
- **JWT Token**: Generic JWT token (works for any authenticated user)
- **SuperAdmin role**: Highest privilege level
- **Admin role**: Bank administrator level
- **User role**: Regular user level

## Important Notes

1. Bank identification is done through JWT token, not URL parameters
2. All bank routes require active bank status (unless specified otherwise)
3. Suspended banks cannot access dashboard/notifications
4. Most list endpoints support search, pagination, and sorting features
5. The API uses `/api/v1` prefix for most routes, except for some customer routes which use `/api/customers`

---

## Example Full URLs

- Bank Login: `https://5hwtmvdt-3000.inc1.devtunnels.ms/api/v1/bankAdmin/banks/login`
- Get Borrowers: `https://5hwtmvdt-3000.inc1.devtunnels.ms/api/v1/bankAdmin/borrowers`
- Customer Registration: `https://5hwtmvdt-3000.inc1.devtunnels.ms/api/customers/register`
- Get Loan Applications: `https://5hwtmvdt-3000.inc1.devtunnels.ms/api/v1/bankAdmin/loan-applications`


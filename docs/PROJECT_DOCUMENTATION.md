# MIS Dashboard — Project Documentation (Unified)

This single document consolidates project setup, architecture, authentication, subscription & payments, API contracts, deployment, and quick references for backend and frontend developers.

Table of contents
- Overview
- Architecture
- Setup & Environment
- Authentication & Auth APIs
- Super Admin Login
- Subscriptions & Payments (APIs & Flow)
- Invoice PDF generation
- Database schema suggestions
- Security & Dashboard fixes summary
- Quick reference & commands
- Testing checklist
- Deployment
- Contact / Integration points

---

## Overview

The MIS Dashboard is a microfinance administration frontend built with React + TypeScript, Material-UI, Redux Toolkit, and Socket.io. It provides role-based access (Super Admin, Admin, Customer), protected routes, real-time updates, and modular services for integration with a backend API.

This unified doc gathers existing `docs/*.md` content into one place (architecture, setup, auth, payment/subscription flows, quick reference).

---

## Architecture (summary)

- Presentation: `src/pages`, `src/sections`, `src/layouts` (React + MUI)
- Business logic: `src/store` (Redux Toolkit slices, thunks)
- Service layer: `src/redux/services` / `src/services` (Axios-based API clients, socket client)
- Data layer: backend APIs, DB (subscriptions, payments), localStorage for tokens, Redux store for runtime state

Key patterns:
- BaseApiService for CRUD endpoints
- Axios interceptors for auth and refresh logic
- Socket service for real-time notifications and stats
- Typed hooks: `useAuth`, `useApi`, `useNotifications`, `useStats`

---

## Setup & Environment (quick)

1. Create `.env.development` with API and socket settings (see previous docs for example).
2. Install: `npm install` or `yarn install`
3. Run: `npm run dev` (app at http://localhost:3039)
4. Build: `npm run build`

Common scripts:
- `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run lint:fix`, `npm run fm:fix`

---

## Authentication & Auth APIs

Frontend expects standard auth endpoints:
- `POST /api/auth/login` — email/password login (returns token, refreshToken, user)
- `POST /api/auth/google` — Google OAuth login (credential)
- `GET /api/auth/me` — current user
- `POST /api/auth/register` — registration
- `POST /api/auth/logout` — logout
- `POST /api/auth/refresh` — refresh token

User object shape (example):
```ts
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
  permissions: string[];
}
```

Frontend uses:
- token stored in localStorage (consider httpOnly cookies for production)
- axios interceptors to attach Authorization header and refresh tokens automatically
- Redux slice `auth.slice.ts` to store user/token and maintain `isInitialized`

---

## Super Admin Login

Endpoint required: `POST /superadmin-login` (or `POST /api/auth/login` with role handling).

Request:
```json
{ "email": "...", "password": "...", "rememberMe": true }
```

Response: standard AuthResponse with token and user.role === SUPER_ADMIN.

Frontend uses `authService.superAdminLogin` thunk and `useAuth().loginSuperAdmin`.

---

## Subscriptions & Payments — Backend API Contract

This section is the canonical source for payment/subscription APIs used by the frontend.

Endpoints:

1) Search bank by code
- `GET /api/banks/search?code={bankCode}`
- Returns bank details (id, code, name, contact, status, etc.)

2) Get bank subscription details
- `GET /api/banks/{bankId}/subscription-details`
- Returns: last payment (date, amount, method, tx id), nextPaymentAmount, subscription status, endDate

3) Record payment (Super Admin)
- `POST /api/banks/subscriptions/record-payment`
- Body:
```json
{
  "bankId": "string",
  "amount": 50000,
  "paymentMethod": "bank_transfer"|"cash"|"cheque"|"online"|"other",
  "paymentDate": "YYYY-MM-DD",
  "transactionId": "...", 
  "notes": "..."
}
```
- Behavior (business logic):
  - Validate bank exists and is active
  - Persist payment record
  - Create or update subscription:
    * If no subscription → create monthly subscription (start = paymentDate, end = +1 month)
    * If expired → renew as new month from paymentDate
    * If active → extend end date by 1 month
  - Set subscription `status = active`
  - Calculate `nextBillingDate = endDate`
  - Generate invoice PDF and return invoice/payment id

4) Generate/download invoice
- `GET /api/banks/subscriptions/payments/{paymentId}/invoice`
- Returns `application/pdf` (binary blob)

5) List subscriptions (admin)
- `GET /api/banks/subscriptions?search=&page=&limit=&status=&sortBy=&sortOrder=`

6) Renew/cancel endpoints
- `POST /api/banks/subscriptions/{subscriptionId}/renew`
- `POST /api/banks/subscriptions/{subscriptionId}/cancel`

Data models (summary):
- Subscription:
  - `_id, bankId, bankName, planName, amount, status, startDate, endDate, nextBillingDate, lastPaymentDate, lastPaymentAmount, totalPayments`
- Payment:
  - `_id, bankId, subscriptionId, amount, paymentMethod, paymentDate, transactionId, notes, invoiceId, createdBy`

DB suggestions (SQL example) included in original docs — use that as starting point.

---

## Invoice PDF generation

Requirements:
- Invoice contains invoice number, date, bank details (name/code/address), payment details, subscription period, company details, totals and status.
- Invoice should be generated server-side and returned as PDF blob.
- API should return a unique `invoiceId` associated with the payment.

Implementation notes for backend:
- Use a robust PDF generation library (e.g., Puppeteer printing an HTML template, PDFKit, or server-side HTML-to-PDF)
- Ensure invoices are stored/archived and retrievable by `invoiceId` (or generated on-the-fly if reproducible)
- Return appropriate Content-Type and set caching headers if required

---

## Dashboard security fixes & notes (summary)

Key security fixes applied in the frontend:
- Protected routes with `ProtectedRoute`, role guards (`RoleGuard`, `MultiRoleGuard`)
- Auth initialization and persistence (`initializeAuth`), `isInitialized` flag
- Token refresh in axios interceptor with retry logic
- Socket reconnection after auth initialization
- `clearAuth()` integrated with Redux and socket disconnect

Backend implications:
- Ensure token refresh endpoint and refresh token strategy
- Implement role and permission checks server-side
- Use HTTPS and consider httpOnly cookies for tokens in production

---

## Quick Reference (for developers)

- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Type-check: `npm run tsc:watch`
- API client: `src/redux/services/*` / `src/services/api/*`
- Payment endpoints are used by `src/sections/bank/payments/*`

---

## Testing checklist (critical)

- Bank search by code returns bank details
- Subscription details endpoint returns last payment and nextPaymentAmount
- Recording payment:
  - Creates payment record
  - Activates/creates/renews subscription
  - Returns paymentId and invoiceId
  - Invoice endpoint returns PDF blob
- Token refresh and protected routes behavior

---

## Deployment & Docker

Build static asset: `npm run build`. Recommended Dockerfile pattern included in previous docs; frontend can be hosted behind CDN and backend on Node/Express.

---

## Integration points / Files (frontend references)

- `src/sections/bank/payments/bank-payment-dialog.tsx` — bank code search & payment recording UI\n+- `src/redux/services/bank.services.tsx` — bank APIs (searchBankByCode, getBankSubscriptionDetails)\n+- `src/redux/services/payment.services.tsx` — recordPayment, generateInvoice\n+- `src/sections/bank/payments/bank-payments-view.tsx` — subscriptions management page\n+
---

For backend clarifications, refer to the individual API sections above and the example requests shown in each section.\n*** End Patch"}}

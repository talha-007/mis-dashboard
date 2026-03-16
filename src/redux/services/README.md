# Redux Services — API Structure by Role

Services are organized by **role** so it's clear which APIs belong to which user type.

## Folder Structure

```
src/redux/services/
├── http-common.tsx          # Axios instance, interceptors
├── index.ts                 # Main barrel export
├── socket.ts                # Re-export for socket (shared)
├── README.md
│
├── shared/                  # Shared across all roles
│   ├── common.services.ts    # /api/v1/me, /api/v1/users/:id
│   ├── notifications.services.ts
│   └── socket.services.ts   # Real-time Socket.io
│
├── superadmin/              # SuperAdmin role
│   └── superadmin.services.ts
│       # Banks, subscriptions, system users, stats
│
├── bank-admin/              # Bank Admin role
│   └── bank-admin.services.ts
│       # Borrowers, loan-applications, assessments, payments,
│       # recovery, installments, employees, reports, settings
│
├── employee/                # Employee (Recovery Officer) role
│   └── employee.services.ts
│       # My cases, customers, apply loan on behalf, assessments
│
├── customer/                # Customer role (public/auth)
│   ├── customer.services.ts # Register, login, profile, rates
│   └── payoff-offer.services.ts
│
├── system-user/             # Customer (logged-in) role
│   └── system-user.services.ts
│       # Loan applications, assessments (my)
│
├── auth/                    # Auth facade
│   ├── auth.services.tsx    # Delegates to role-specific auth
│   └── bank-auth.services.tsx
│
└── facades/                 # Domain facades (used by components)
    ├── bank.services.tsx    # Superadmin + Bank Admin
    ├── borrower.services.tsx
    ├── loan-applications.services.ts
    ├── payment.services.tsx
    ├── users.services.ts
    └── assessment.services.ts
```

## Role → APIs

| Role        | APIs |
|-------------|------|
| **SuperAdmin** | Banks (CRUD, status), subscriptions, system users, stats |
| **Bank Admin** | Borrowers, loan-applications, assessments, bank-questions, payment-ledgers, recovery-overdues, installments, employees, reports, settings, stats |
| **Employee**   | My cases, customers (CRUD), apply loan on behalf, submit assessment on behalf |
| **Customer**   | Register, login, profile, bank-questions, rates, assessments/submit, payoff-offers |
| **System User**| Loan applications (create), assessments (submit, my-assessments) |
| **Shared**     | /me, notifications |

## Root Re-exports

Root files (e.g. `auth.services.tsx`, `bank-admin.services.ts`) re-export from the folders above so existing imports keep working.

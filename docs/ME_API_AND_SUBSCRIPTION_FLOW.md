# /me API and Subscription Check Flow

## Overview

- A **`/me`** API is called after **any user login** (super admin, bank admin, customer).
- The response includes the current user profile plus **`subscriptionStatus`** (relevant for bank admins).
- For **bank admin** role: if `subscriptionStatus` is not **active**, the user is shown a subscription/payment screen. After successful payment, the subscription becomes active and the bank admin can access dashboard pages.

---

## 1. /me API

### Purpose

- Return the currently authenticated user’s profile using the token sent in the request.
- Used after login to get consistent user + subscription state (and optionally to refresh profile/subscription on app load).

### When It Is Called

- **On login (any role):** After a successful login response (token received), the frontend calls `/me` to get the full profile including `subscriptionStatus`.
- **On app init (optional):** When restoring session from localStorage, call `/me` to refresh user and subscription status.

### Endpoint

- **Method:** `GET`
- **Path:** `/api/me` (or role-specific e.g. `/api/banks/me` for bank admin, depending on backend design)
- **Auth:** Bearer token (from login response) in `Authorization` header.

### Response Shape (example)

```json
{
  "data": {
    "id": "699063d281485c7682ff68b6",
    "name": "Charissa Padilla",
    "email": "dibuqubiny@yopmail.com",
    "role": "admin",
    "subscriptionStatus": "inactive"
  }
}
```

### Fields

| Field               | Type   | Description                                      |
|---------------------|--------|--------------------------------------------------|
| `id`                | string | User/bank ID                                     |
| `name`              | string | Display name                                     |
| `email`             | string | Email                                            |
| `role`              | string | `superadmin` \| `admin` \| `customer`            |
| `subscriptionStatus`| string | `active` \| `inactive` (for bank admin; optional for other roles) |

---

## 2. Subscription Check (Bank Admin Only)

### Rule

- **Role = bank admin (`admin`)** and **subscriptionStatus ≠ `active`**  
  → User must be shown the **subscription/payment** experience and must **not** access normal dashboard pages until subscription is active.

### Flow

1. User logs in as **bank admin** → receives token.
2. Frontend calls **`/me`** with that token.
3. If **`subscriptionStatus === 'active'`**  
   → Allow access to bank admin dashboard and all allowed pages.
4. If **`subscriptionStatus !== 'active'`** (e.g. `inactive`)  
   → Redirect (or show) a **subscription/payment** screen:
   - Explain that subscription is inactive.
   - Show amount to pay and how to pay (e.g. payment link, gateway, or “Contact support”).
   - After payment is completed (backend marks subscription as active):
     - Either user refreshes or frontend calls **`/me`** again.
     - Response now has **`subscriptionStatus: 'active'`**.
   - Then allow access to bank admin pages.

### Where to Enforce

- **Frontend:** After login and after `/me`:
  - If `role === 'admin'` and `subscriptionStatus !== 'active'` → show subscription/payment UI and block access to dashboard routes.
  - When `subscriptionStatus === 'active'` → allow normal routing for bank admin.
- **Backend (recommended):** Also enforce on protected bank-admin APIs so that even if the frontend is bypassed, inactive subscriptions cannot access paid features.

---

## 3. Implementation Checklist (Frontend)

- [ ] Add **auth service** method: `getMe()` → `GET /api/me` (or correct path from backend).
- [ ] After **super admin login** → call `getMe()`, store user (and subscriptionStatus if returned).
- [ ] After **bank admin login** → call `getMe()`, store user and **subscriptionStatus**.
- [ ] After **customer login** → call `getMe()` if backend supports it for customers; store user (subscriptionStatus can be ignored for customers).
- [ ] Extend **user type / auth state** to include `subscriptionStatus`.
- [ ] Add **subscription guard** or route check: for `role === 'admin'`, if `subscriptionStatus !== 'active'` → render subscription/payment page and do not render dashboard.
- [ ] Build **subscription/payment page** for bank admin (message, amount, payment CTA or link).
- [ ] After payment completion (or “refresh status” action), call **`/me`** again and update auth state; once `subscriptionStatus === 'active'` → allow access to bank admin pages.

---

## 4. Backend Notes (for reference)

- Implement **GET /api/me** (or per-role `/api/banks/me`, etc.) that:
  - Reads user from token.
  - Returns `id`, `name`, `email`, `role`, and for bank admin **`subscriptionStatus`** (`active` | `inactive`).
- Ensure login response and `/me` use the same token so that calling `/me` right after login returns the same user and subscription state.
- When payment is completed, backend sets the bank’s subscription to **active** so that the next `/me` call returns `subscriptionStatus: 'active'`.

---

## 5. Summary

| Step | Action |
|------|--------|
| 1 | User logs in (any role) → frontend gets token. |
| 2 | Frontend calls **GET /me** with token. |
| 3 | Response includes `id`, `name`, `email`, `role`, `subscriptionStatus`. |
| 4 | **Bank admin** and `subscriptionStatus !== 'active'` → show pay/subscription screen; block dashboard. |
| 5 | After payment, backend sets subscription active; frontend calls **/me** again → `subscriptionStatus: 'active'` → allow access. |

This keeps a single source of truth for “current user + subscription” via **/me** and a clear rule: **bank admin sees pages only when subscription is active.**

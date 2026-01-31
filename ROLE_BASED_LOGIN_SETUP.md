# Role-Based Login System

This document describes the role-based login system implemented in the MIS Dashboard.

## Overview

The application now supports three distinct user roles, each with their own dedicated login page:

1. **Super Admin** - Full system access and control
2. **Admin** - Operations and user management
3. **Customer** - Account and loan access

## User Roles

### 1. Super Admin (`UserRole.SUPER_ADMIN`)

**Permissions:** All permissions (full access)

**Navigation Access:**
- Portfolio Overview
- Borrower Management
- Loan Applications
- Recoveries & Overdues
- Payments & Ledger
- Credit Ratings
- MIS & Reports

**Login URL:** `/sign-in/superadmin`

**Mock Credentials (Dev Mode):**
- Email: `admin@mis.local`
- Password: Any (bypassed in dev mode)

---

### 2. Admin (`UserRole.ADMIN`)

**Permissions:**
- View Users
- View/Create/Edit/Approve Accounts
- View/Create/Approve Transactions
- View/Create/Approve/Reject Loans
- View/Export Reports

**Navigation Access:**
- Portfolio Overview
- Borrower Management
- Loan Applications
- Recoveries & Overdues
- Payments & Ledger
- MIS & Reports

**Login URL:** `/sign-in/admin`

**Mock Credentials (Dev Mode):**
- Email: `admin@example.com`
- Password: Any (bypassed in dev mode)

---

### 3. Customer (`UserRole.CUSTOMER`)

**Permissions:**
- View Accounts
- View Transactions
- View/Create Loans

**Navigation Access:**
- Dashboard
- Announcements

**Login URL:** `/sign-in/customer`

**Mock Credentials (Dev Mode):**
- Email: `customer@mis.local`
- Password: Any (bypassed in dev mode)

---

## Login Flow

### 1. Landing Page (`/sign-in`)

When users visit `/sign-in`, they see a role selector page with three options:

```
┌─────────────────────────────────────┐
│     Welcome to MIS Dashboard        │
│  Select your role to continue       │
├─────────────────────────────────────┤
│  🛡️  Super Admin                    │
│     Full system access and control  │
├─────────────────────────────────────┤
│  👤  Admin                          │
│     Manage operations and users     │
├─────────────────────────────────────┤
│  👥  Customer                       │
│     Access your account and loans   │
└─────────────────────────────────────┘
```

### 2. Role-Specific Login Pages

Each role has a dedicated login page with:
- Role-specific branding and colors
- Back button to return to role selector
- Role badge indicating access level
- Standard email/password form

**Super Admin Login:**
- Purple theme (`#4D0CE7`)
- Shield star icon
- "Full Access" badge

**Admin Login:**
- Blue theme (`#1877F2`)
- User ID icon
- "Operations" badge

**Customer Login:**
- Green theme (`#00A76F`)
- User icon
- "Account Access" badge
- Google Sign-In option
- Registration link

### 3. Post-Login Redirect

After successful login, users are redirected to `/` (dashboard) where:
- Navigation menu is customized based on their role
- Protected routes enforce role-based access
- Unauthorized access attempts redirect to `/unauthorized`

---

## File Structure

### Pages
```
src/pages/
├── sign-in.tsx                    # Role selector landing page
├── sign-in-superadmin.tsx         # Super Admin login
├── sign-in-admin.tsx              # Admin login
└── sign-in-customer.tsx           # Customer login
```

### Views
```
src/sections/auth/
├── sign-in-role-selector-view.tsx # Role selection UI
├── sign-in-superadmin-view.tsx    # Super Admin login form
├── sign-in-admin-view.tsx         # Admin login form
└── sign-in-customer-view.tsx      # Customer login form
```

### Configuration
```
src/types/auth.types.ts            # Role definitions and permissions
src/utils/mock-auth.ts             # Mock users for development
src/layouts/nav-config-dashboard.tsx # Role-based navigation
```

---

## Routes Configuration

```typescript
// Role selector (landing page)
/sign-in → SignInRoleSelectorView

// Role-specific login pages
/sign-in/superadmin → SignInSuperAdminView
/sign-in/admin → SignInAdminView
/sign-in/customer → SignInCustomerView

// All wrapped with GuestOnlyRoute (redirects authenticated users)
```

---

## Development Mode

### Using Mock Users

Set environment variables in `.env`:

```env
VITE_BYPASS_AUTH=true
VITE_MOCK_USER=superadmin  # or 'admin' or 'customer'
```

This will:
- Skip actual authentication
- Use mock user data
- Auto-login with selected role

### Mock User Data

Located in `src/utils/mock-auth.ts`:

```typescript
MOCK_USERS = {
  superadmin: { /* full permissions */ },
  admin: { /* operations permissions */ },
  customer: { /* limited permissions */ }
}
```

---

## Security Features

### 1. Guest-Only Routes
Login pages are wrapped with `GuestOnlyRoute` component that:
- Redirects authenticated users to dashboard
- Prevents duplicate login attempts

### 2. Protected Routes
Dashboard routes use `ProtectedRoute` component that:
- Requires authentication
- Redirects unauthenticated users to `/sign-in`

### 3. Role Guards
Individual routes use `RoleGuard` or `MultiRoleGuard` that:
- Check user role/permissions
- Redirect unauthorized users to `/unauthorized`
- Enforce granular access control

### 4. Navigation Filtering
Navigation menu is filtered based on:
- User role (via `getNavDataByRole`)
- Required permissions (via `requiredPermission` prop)

---

## Customization

### Adding a New Role

1. **Update UserRole enum:**
```typescript
// src/types/auth.types.ts
export enum UserRole {
  SUPER_ADMIN = 'superadmin',
  ADMIN = 'admin',
  MANAGER = 'manager', // New role
  CUSTOMER = 'customer',
}
```

2. **Define permissions:**
```typescript
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // ...
  [UserRole.MANAGER]: [
    Permission.VIEW_USERS,
    Permission.VIEW_REPORTS,
    // ... manager permissions
  ],
}
```

3. **Create login view:**
```typescript
// src/sections/auth/sign-in-manager-view.tsx
export function SignInManagerView() {
  // Similar to other role views
}
```

4. **Create page:**
```typescript
// src/pages/sign-in-manager.tsx
export default function Page() {
  return <SignInManagerView />;
}
```

5. **Add route:**
```typescript
// src/routes/sections.tsx
{
  path: 'sign-in/manager',
  element: (
    <GuestOnlyRoute>
      <AuthLayout>
        <SignInManagerPage />
      </AuthLayout>
    </GuestOnlyRoute>
  ),
}
```

6. **Add to role selector:**
```typescript
// src/sections/auth/sign-in-role-selector-view.tsx
const ROLES: RoleCard[] = [
  // ...
  {
    role: 'manager',
    title: 'Manager',
    description: 'Manage team operations',
    icon: 'solar:users-group-rounded-bold-duotone',
    color: '#FF5630',
    path: '/sign-in/manager',
  },
]
```

7. **Configure navigation:**
```typescript
// src/layouts/nav-config-dashboard.tsx
export const managerNavData: NavItem[] = [
  // ... manager navigation items
];

export const getNavDataByRole = (role: UserRole): NavItem[] => {
  switch (role) {
    // ...
    case UserRole.MANAGER:
      return managerNavData;
    // ...
  }
};
```

---

## Testing

### Manual Testing

1. **Test Role Selector:**
   - Visit `/sign-in`
   - Verify all three role cards are displayed
   - Click each card and verify navigation

2. **Test Each Login Page:**
   - Verify role-specific branding
   - Test back button
   - Test form submission
   - Verify error handling

3. **Test Role-Based Access:**
   - Login as each role
   - Verify navigation menu items
   - Test protected routes
   - Verify unauthorized redirects

### Automated Testing

```typescript
// Example test
describe('Role-Based Login', () => {
  it('should show role selector on /sign-in', () => {
    // Test implementation
  });

  it('should redirect to role-specific login', () => {
    // Test implementation
  });

  it('should enforce role-based navigation', () => {
    // Test implementation
  });
});
```

---

## Troubleshooting

### Issue: Login redirects to wrong page
**Solution:** Check `GuestOnlyRoute` redirect configuration

### Issue: Navigation items not showing
**Solution:** Verify `getNavDataByRole` includes the role

### Issue: Unauthorized access not blocked
**Solution:** Ensure routes are wrapped with `RoleGuard`

### Issue: Mock user not working
**Solution:** Check `.env` variables and `ENV.DEV.BYPASS_AUTH`

---

## Best Practices

1. **Always use role guards** on protected routes
2. **Keep permissions granular** for fine-grained access control
3. **Test all role combinations** when adding new features
4. **Document role capabilities** in user guides
5. **Use mock users** for development and testing
6. **Implement proper error handling** for auth failures

---

## Future Enhancements

- [ ] Multi-factor authentication (MFA)
- [ ] Role-based dashboard layouts
- [ ] Dynamic permission management
- [ ] Session timeout warnings
- [ ] Login activity logs
- [ ] Password strength requirements
- [ ] Account lockout after failed attempts

---

## Support

For questions or issues related to the role-based login system:
- Check this documentation first
- Review code comments in auth-related files
- Contact the development team

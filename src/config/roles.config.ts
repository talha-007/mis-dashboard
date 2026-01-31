/**
 * Role-Based Access Control Configuration
 */

import { UserRole, Permission, ROLE_PERMISSIONS } from 'src/types/auth.types';

// Route Permissions - Which routes require which permissions
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  // Dashboard routes
  '/': [Permission.VIEW_ACCOUNTS], // Home dashboard
  '/dashboard': [Permission.VIEW_ACCOUNTS],
  
  // User management (Super Admin only)
  '/users': [Permission.VIEW_USERS],
  '/users/create': [Permission.CREATE_USERS],
  '/users/:id/edit': [Permission.EDIT_USERS],
  
  // Account management
  '/accounts': [Permission.VIEW_ACCOUNTS],
  '/accounts/create': [Permission.CREATE_ACCOUNTS],
  '/accounts/:id': [Permission.VIEW_ACCOUNTS],
  
  // Transactions
  '/transactions': [Permission.VIEW_TRANSACTIONS],
  '/transactions/create': [Permission.CREATE_TRANSACTIONS],
  
  // Loans
  '/loans': [Permission.VIEW_LOANS],
  '/loans/apply': [Permission.CREATE_LOANS],
  '/loans/:id': [Permission.VIEW_LOANS],
  
  // Reports (Admin only)
  '/reports': [Permission.VIEW_REPORTS],
  
  // Settings (Admin only)
  '/settings': [Permission.MANAGE_SETTINGS],
  '/audit-logs': [Permission.VIEW_AUDIT_LOGS],
};

// Role-based route access
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    '/',
    '/dashboard',
    '/bank-management',
    '/borrower-management',
    '/loan-applications',
    '/recoveries-overdues',
    '/payments-ledger',
    '/credit-ratings',
    '/mis-reports',
    '/users',
    '/accounts',
    '/transactions',
    '/loans',
    '/reports',
    '/settings',
    '/audit-logs',
    '/blog',
  ],
  [UserRole.ADMIN]: [
    '/',
    '/dashboard',
    '/borrower-management',
    '/loan-applications',
    '/recoveries-overdues',
    '/payments-ledger',
    '/credit-ratings',
    '/mis-reports',
    '/reports',
    '/accounts',
    '/transactions',
    '/loans',
    '/blog',
  ],
  [UserRole.CUSTOMER]: [
    '/',
    '/dashboard',
    '/apply-loan',
    '/profile',
    '/documents',
    '/installments',
    '/my-credit-rating',
    '/pay-installment',
    '/payoff-offer',
    '/accounts',
    '/transactions',
    '/loans',
    '/blog',
  ],
};

// Default redirects after login based on role
export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: '/',
  [UserRole.ADMIN]: '/',
  [UserRole.CUSTOMER]: '/',
};

// Get permissions for a role
export const getRolePermissions = (role: UserRole): Permission[] => ROLE_PERMISSIONS[role] || [];

// Check if role has access to route
export const canAccessRoute = (role: UserRole, route: string): boolean => {
  const allowedRoutes = ROLE_ROUTES[role] || [];
  
  // Check exact match first
  if (allowedRoutes.includes(route)) {
    return true;
  }
  
  // Check if any allowed route pattern matches
  return allowedRoutes.some((allowedRoute) => {
    // Convert route pattern to regex (simple version)
    const pattern = allowedRoute.replace(/:\w+/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(route);
  });
};

// Check if role has permission
export const roleHasPermission = (role: UserRole, permission: Permission): boolean => {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
};

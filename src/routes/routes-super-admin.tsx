/**
 * Super Admin Routes
 * Routes accessible only to SUPER_ADMIN role
 */

import type { RouteObject } from 'react-router';

import { lazy } from 'react';

import { RoleGuard } from 'src/components/auth';

import { UserRole } from 'src/types/auth.types';

// Import pages directly from their source, not from sections (avoid circular deps)
const BankManagementPage = lazy(() => import('src/pages/super-admin/bank-management'));
const BankFormPage = lazy(() => import('src/pages/super-admin/bank-form'));
const BankPaymentsPage = lazy(() => import('src/pages/super-admin/bank-payments'));
const SettingsPage = lazy(() => import('src/pages/super-admin/settings'));
const UserPage = lazy(() => import('src/pages/super-admin/user'));

export const superAdminRoutes: RouteObject[] = [
  {
    path: 'bank-management',
    element: (
      <RoleGuard requiredRole={UserRole.SUPER_ADMIN}>
        <BankManagementPage />
      </RoleGuard>
    ),
  },
  {
    path: 'bank-management/form',
    element: (
      <RoleGuard requiredRole={UserRole.SUPER_ADMIN}>
        <BankFormPage />
      </RoleGuard>
    ),
  },
  {
    path: 'subscriptions',
    element: (
      <RoleGuard requiredRole={UserRole.SUPER_ADMIN}>
        <BankPaymentsPage />
      </RoleGuard>
    ),
  },
  {
    path: 'settings',
    element: (
      <RoleGuard requiredRole={UserRole.SUPER_ADMIN}>
        <SettingsPage />
      </RoleGuard>
    ),
  },
  {
    path: 'user',
    element: (
      <RoleGuard requiredRole={UserRole.SUPER_ADMIN}>
        <UserPage />
      </RoleGuard>
    ),
  },
];

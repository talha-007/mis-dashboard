/**
 * Admin Routes
 * Routes accessible to ADMIN and SUPER_ADMIN roles
 */

import type { RouteObject } from 'react-router';

import { lazy } from 'react';

import { MultiRoleGuard } from 'src/components/auth';

import { UserRole } from 'src/types/auth.types';

// Import pages directly from their source, not from sections (avoid circular deps)
const BorrowerManagementPage = lazy(() => import('src/pages/admin/borrower-management'));
const BorrowerAddPage = lazy(() => import('src/pages/admin/borrower-add'));
const BorrowerEditPage = lazy(() => import('src/pages/admin/borrower-edit'));
const LoanApplicationPage = lazy(() => import('src/pages/admin/loan-application'));
const RecoveryPage = lazy(() => import('src/pages/admin/recovery'));
const PaymentPage = lazy(() => import('src/pages/admin/payment'));
const CreditRatingsPage = lazy(() => import('src/pages/admin/credit-ratings'));
const MISReportsPage = lazy(() => import('src/pages/admin/mis-reports'));

export const adminRoutes: RouteObject[] = [
  {
    path: 'borrower-management',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <BorrowerManagementPage />
      </MultiRoleGuard>
    ),
  },
  {
    path: 'borrower-management/add',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <BorrowerAddPage />
      </MultiRoleGuard>
    ),
  },
  {
    path: 'borrower-management/edit/:id',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <BorrowerEditPage />
      </MultiRoleGuard>
    ),
  },
  {
    path: 'loan-applications',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <LoanApplicationPage />
      </MultiRoleGuard>
    ),
  },
  {
    path: 'recoveries-overdues',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <RecoveryPage />
      </MultiRoleGuard>
    ),
  },
  {
    path: 'payments-ledger',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <PaymentPage />
      </MultiRoleGuard>
    ),
  },
  {
    path: 'credit-ratings',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <CreditRatingsPage />
      </MultiRoleGuard>
    ),
  },
  {
    path: 'mis-reports',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <MISReportsPage />
      </MultiRoleGuard>
    ),
  },
];

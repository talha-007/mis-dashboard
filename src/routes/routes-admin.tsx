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
const AssessmentPage = lazy(() => import('src/pages/admin/assessment'));
const CreditProposalReportsPage = lazy(() => import('src/pages/admin/credit-proposal-reports'));
const CreditProposalReportDetailPage = lazy(
  () => import('src/pages/admin/credit-proposal-report-detail')
);
const UsersManagementPage = lazy(() => import('src/pages/admin/users-management'));
const UsersAddPage = lazy(() => import('src/pages/admin/users-add'));
const UsersEditPage = lazy(() => import('src/pages/admin/users-edit'));
const UsersDetailPage = lazy(() => import('src/pages/admin/users-detail'));

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
    path: 'assessment',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <AssessmentPage />
      </MultiRoleGuard>
    ),
  },
  {
    path: 'credit-proposal-reports',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <CreditProposalReportsPage />
      </MultiRoleGuard>
    ),
  },
  {
    path: 'credit-proposal-reports/:id',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <CreditProposalReportDetailPage />
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
  {
    path: 'users-management',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <UsersManagementPage />
      </MultiRoleGuard>
    ),
  },
  {
    path: 'users-management/add',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <UsersAddPage />
      </MultiRoleGuard>
    ),
  },
  {
    path: 'users-management/edit/:userId',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <UsersEditPage />
      </MultiRoleGuard>
    ),
  },
  {
    path: 'users-management/view/:userId',
    element: (
      <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
        <UsersDetailPage />
      </MultiRoleGuard>
    ),
  },
];

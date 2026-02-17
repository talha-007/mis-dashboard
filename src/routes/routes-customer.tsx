/**
 * Customer Routes
 * Routes accessible only to CUSTOMER role
 */

import type { RouteObject } from 'react-router';

import { lazy } from 'react';

import { RoleGuard } from 'src/components/auth';

import { UserRole } from 'src/types/auth.types';

// Import pages directly from their source, not from sections (avoid circular deps)
const ApplyLoanPage = lazy(() => import('src/pages/customer/apply-loan'));
const ApplyLoanFormPage = lazy(() => import('src/pages/customer/apply-loan-form'));
const AssessmentPage = lazy(() => import('src/pages/customer/assessment'));
const DocumentsPage = lazy(() => import('src/pages/customer/documents'));
const InstallmentsPage = lazy(() => import('src/pages/customer/installments'));
const MyCreditRatingPage = lazy(() => import('src/pages/customer/my-credit-rating'));
const PayInstallmentPage = lazy(() => import('src/pages/customer/pay-installment'));
const PayoffOfferPage = lazy(() => import('src/pages/customer/payoff-offer'));

export const customerRoutes: RouteObject[] = [
  {
    path: 'apply-loan',
    element: (
      <RoleGuard requiredRole={UserRole.CUSTOMER}>
        <ApplyLoanPage />
      </RoleGuard>
    ),
  },
  {
    path: 'apply-loan/new',
    element: (
      <RoleGuard requiredRole={UserRole.CUSTOMER}>
        <ApplyLoanFormPage />
      </RoleGuard>
    ),
  },
  {
    path: 'apply-loan/:id',
    element: (
      <RoleGuard requiredRole={UserRole.CUSTOMER}>
        <ApplyLoanFormPage />
      </RoleGuard>
    ),
  },
  {
    path: 'assessment',
    element: (
      <RoleGuard requiredRole={UserRole.CUSTOMER}>
        <AssessmentPage />
      </RoleGuard>
    ),
  },
  {
    path: 'documents',
    element: (
      <RoleGuard requiredRole={UserRole.CUSTOMER}>
        <DocumentsPage />
      </RoleGuard>
    ),
  },
  {
    path: 'installments',
    element: (
      <RoleGuard requiredRole={UserRole.CUSTOMER}>
        <InstallmentsPage />
      </RoleGuard>
    ),
  },
  {
    path: 'my-credit-rating',
    element: (
      <RoleGuard requiredRole={UserRole.CUSTOMER}>
        <MyCreditRatingPage />
      </RoleGuard>
    ),
  },
  {
    path: 'pay-installment',
    element: (
      <RoleGuard requiredRole={UserRole.CUSTOMER}>
        <PayInstallmentPage />
      </RoleGuard>
    ),
  },
  {
    path: 'payoff-offer',
    element: (
      <RoleGuard requiredRole={UserRole.CUSTOMER}>
        <PayoffOfferPage />
      </RoleGuard>
    ),
  },
];

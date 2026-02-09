import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { RoleGuard, ProtectedRoute, MultiRoleGuard, AuthRouteGuard } from 'src/components/auth';

import { UserRole } from 'src/types/auth.types';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const BankManagementPage = lazy(() => import('src/pages/bank-management'));
export const BankFormPage = lazy(() => import('src/pages/bank-form'));
export const BankPaymentsPage = lazy(() => import('src/pages/bank-payments'));
export const BorrowerManagementPage = lazy(() => import('src/pages/borrower-management'));
export const LoanApplicationPage = lazy(() => import('src/pages/loan-application'));
export const RecoveryPage = lazy(() => import('src/pages/recovery'));
export const PaymentPage = lazy(() => import('src/pages/payment'));
export const CreditRatingsPage = lazy(() => import('src/pages/credit-ratings'));
export const MISReportsPage = lazy(() => import('src/pages/mis-reports'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const ApplyLoanPage = lazy(() => import('src/pages/apply-loan'));
export const ProfilePage = lazy(() => import('src/pages/profile'));
export const DocumentsPage = lazy(() => import('src/pages/documents'));
export const InstallmentsPage = lazy(() => import('src/pages/installments'));
export const MyCreditRatingPage = lazy(() => import('src/pages/my-credit-rating'));
export const PayInstallmentPage = lazy(() => import('src/pages/pay-installment'));
export const PayoffOfferPage = lazy(() => import('src/pages/payoff-offer'));
export const SettingsPage = lazy(() => import('src/pages/settings'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const SignInSuperAdminPage = lazy(() => import('src/pages/sign-in-superadmin'));
export const SignInAdminPage = lazy(() => import('src/pages/sign-in-admin'));
export const SignInCustomerPage = lazy(() => import('src/pages/sign-in-customer'));
export const RegisterPage = lazy(() => import('src/pages/register'));
export const ForgotPasswordPage = lazy(() => import('src/pages/forgot-password'));
export const ForgotPasswordAdminPage = lazy(() => import('src/pages/forgot-password-admin'));
export const VerifyOtpPage = lazy(() => import('src/pages/verify-otp'));
export const VerifyOtpAdminPage = lazy(() => import('src/pages/verify-otp-admin'));
export const UnauthorizedPage = lazy(() => import('src/pages/unauthorized'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { 
        index: true, 
        element: (
          <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CUSTOMER]}>
            <DashboardPage />
          </MultiRoleGuard>
        )
      },
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
        path: 'borrower-management',
        element: (
          <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
            <BorrowerManagementPage />
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
      { 
        path: 'user', 
        element: (
          <RoleGuard requiredRole={UserRole.SUPER_ADMIN}>
            <UserPage />
          </RoleGuard>
        ),
      },
      // Customer routes
      {
        path: 'apply-loan',
        element: (
          <RoleGuard requiredRole={UserRole.CUSTOMER}>
            <ApplyLoanPage />
          </RoleGuard>
        ),
      },
      {
        path: 'profile',
        element: (
          <RoleGuard requiredRole={UserRole.CUSTOMER}>
            <ProfilePage />
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
      { path: 'blog', element: <BlogPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <SignInCustomerPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
  {
    path: 'sign-in/superadmin',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <SignInSuperAdminPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
  {
    path: 'sign-in/admin',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <SignInAdminPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
  {
    path: 'sign-in/customer',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <SignInCustomerPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
 
  {
    path: 'register',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <RegisterPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
  {
    path: 'admin/forgot-password',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <ForgotPasswordAdminPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
  {
    path: 'forgot-password',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <ForgotPasswordPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
  {
    path: 'admin/verify-otp',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <VerifyOtpAdminPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
  {
    path: 'verify-otp',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <VerifyOtpPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
  {
    path: 'unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];

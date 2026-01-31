import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { RoleGuard, ProtectedRoute, MultiRoleGuard, GuestOnlyRoute } from 'src/components/auth';

import { UserRole } from 'src/types/auth.types';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const BankManagementPage = lazy(() => import('src/pages/bank-management'));
export const BorrowerManagementPage = lazy(() => import('src/pages/borrower-management'));
export const LoanApplicationPage = lazy(() => import('src/pages/loan-application'));
export const RecoveryPage = lazy(() => import('src/pages/recovery'));
export const PaymentPage = lazy(() => import('src/pages/payment'));
export const CreditRatingsPage = lazy(() => import('src/pages/credit-ratings'));
export const MISReportsPage = lazy(() => import('src/pages/mis-reports'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const SignInSuperAdminPage = lazy(() => import('src/pages/sign-in-superadmin'));
export const SignInAdminPage = lazy(() => import('src/pages/sign-in-admin'));
export const SignInCustomerPage = lazy(() => import('src/pages/sign-in-customer'));
export const RegisterPage = lazy(() => import('src/pages/register'));
export const ForgotPasswordPage = lazy(() => import('src/pages/forgot-password'));
export const VerifyOtpPage = lazy(() => import('src/pages/verify-otp'));
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
        )
      },
      { path: 'blog', element: <BlogPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <GuestOnlyRoute>
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      </GuestOnlyRoute>
    ),
  },
  {
    path: 'sign-in/superadmin',
    element: (
      <GuestOnlyRoute>
        <AuthLayout>
          <SignInSuperAdminPage />
        </AuthLayout>
      </GuestOnlyRoute>
    ),
  },
  {
    path: 'sign-in/admin',
    element: (
      <GuestOnlyRoute>
        <AuthLayout>
          <SignInAdminPage />
        </AuthLayout>
      </GuestOnlyRoute>
    ),
  },
  {
    path: 'sign-in/customer',
    element: (
      <GuestOnlyRoute>
        <AuthLayout>
          <SignInCustomerPage />
        </AuthLayout>
      </GuestOnlyRoute>
    ),
  },
 
  {
    path: 'register',
    element: (
      <GuestOnlyRoute>
        <AuthLayout>
          <RegisterPage />
        </AuthLayout>
      </GuestOnlyRoute>
    ),
  },
  {
    path: 'forgot-password',
    element: (
      <GuestOnlyRoute>
        <AuthLayout>
          <ForgotPasswordPage />
        </AuthLayout>
      </GuestOnlyRoute>
    ),
  },
  {
    path: 'verify-otp',
    element: (
      <GuestOnlyRoute>
        <AuthLayout>
          <VerifyOtpPage />
        </AuthLayout>
      </GuestOnlyRoute>
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

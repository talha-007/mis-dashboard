import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { DashboardLayout } from 'src/layouts/dashboard';

import { ProtectedRoute, MultiRoleGuard } from 'src/components/auth';

import { UserRole } from 'src/types/auth.types';

import { authRoutes } from './routes-auth';
import { adminRoutes } from './routes-admin';
import { errorRoutes } from './routes-error';
import { customerRoutes } from './routes-customer';
import { superAdminRoutes } from './routes-super-admin';
import { bankDynamicRoutes } from './routes-bank-dynamic';

// ----------------------------------------------------------------------

// Dashboard
export const DashboardPage = lazy(() => import('src/pages/dashboard/dashboard'));
export const BlogPage = lazy(() => import('src/pages/dashboard/blog'));

// Super Admin
export const BankManagementPage = lazy(() => import('src/pages/super-admin/bank-management'));
export const BankFormPage = lazy(() => import('src/pages/super-admin/bank-form'));
export const BankPaymentsPage = lazy(() => import('src/pages/super-admin/bank-payments'));
export const SettingsPage = lazy(() => import('src/pages/super-admin/settings'));
export const UserPage = lazy(() => import('src/pages/super-admin/user'));

// Admin
export const BorrowerManagementPage = lazy(() => import('src/pages/admin/borrower-management'));
export const LoanApplicationPage = lazy(() => import('src/pages/admin/loan-application'));
export const RecoveryPage = lazy(() => import('src/pages/admin/recovery'));
export const PaymentPage = lazy(() => import('src/pages/admin/payment'));
export const CreditRatingsPage = lazy(() => import('src/pages/admin/credit-ratings'));
export const MISReportsPage = lazy(() => import('src/pages/admin/mis-reports'));

// Customer
export const ApplyLoanPage = lazy(() => import('src/pages/customer/apply-loan'));
export const ProfilePage = lazy(() => import('src/pages/customer/profile'));
export const DocumentsPage = lazy(() => import('src/pages/customer/documents'));
export const InstallmentsPage = lazy(() => import('src/pages/customer/installments'));
export const MyCreditRatingPage = lazy(() => import('src/pages/customer/my-credit-rating'));
export const PayInstallmentPage = lazy(() => import('src/pages/customer/pay-installment'));
export const PayoffOfferPage = lazy(() => import('src/pages/customer/payoff-offer'));

// Auth
export const SignInSuperAdminPage = lazy(() => import('src/pages/auth/sign-in-superadmin'));
export const SignInAdminPage = lazy(() => import('src/pages/auth/sign-in-admin'));
export const SignInCustomerPage = lazy(() => import('src/pages/auth/sign-in-customer'));
export const SignInPage = lazy(() => import('src/pages/auth/sign-in'));
export const RegisterPage = lazy(() => import('src/pages/auth/register'));
export const ForgotPasswordPage = lazy(() => import('src/pages/auth/forgot-password'));
export const ForgotPasswordAdminPage = lazy(() => import('src/pages/auth/forgot-password-admin'));
export const NewPasswordAdminPage = lazy(() => import('src/pages/auth/new-password-admin'));
export const VerifyOtpPage = lazy(() => import('src/pages/auth/verify-otp'));
export const VerifyOtpAdminPage = lazy(() => import('src/pages/auth/verify-otp-admin'));

// Error
export const UnauthorizedPage = lazy(() => import('src/pages/error/unauthorized'));
export const Page404 = lazy(() => import('src/pages/error/page-not-found'));

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
  // ============================================================================
  // AUTHENTICATION ROUTES (Public - Not authenticated)
  // ============================================================================
  ...authRoutes,

  // ============================================================================
  // DYNAMIC BANK ROUTES (Public - Not authenticated)
  // Pattern: /{bank_slug}/register, /{bank_slug}/login, /{bank_slug}/admin/login
  // ============================================================================
  ...bankDynamicRoutes,

  // ============================================================================
  // PROTECTED DASHBOARD ROUTES (Requires Authentication)
  // ============================================================================
  {
    path: '/',
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
      // Dashboard - All authenticated users
      {
        index: true,
        element: (
          <MultiRoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CUSTOMER]}>
            <DashboardPage />
          </MultiRoleGuard>
        ),
      },

      // Import routes from separate files
      ...superAdminRoutes,
      ...adminRoutes,
      ...customerRoutes,

      // Public routes within dashboard
      { path: 'blog', element: <BlogPage /> },
    ],
  },

  // ============================================================================
  // ERROR ROUTES
  // ============================================================================
  ...errorRoutes,
];

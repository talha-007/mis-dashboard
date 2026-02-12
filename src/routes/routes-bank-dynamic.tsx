/**
 * Dynamic Bank Routes
 * Routes with bank slug parameter for customer and admin registration/login
 * Pattern: /{bank_slug}/register, /{bank_slug}/login, /{bank_slug}/admin/login
 */

import type { RouteObject } from 'react-router';

import { lazy } from 'react';

import { AuthLayout } from 'src/layouts/auth';
import { AuthRouteGuard } from 'src/components/auth';

// Import pages directly from their source
const SignInAdminPage = lazy(() => import('src/pages/auth/sign-in-admin'));
const SignInCustomerPage = lazy(() => import('src/pages/auth/sign-in-customer'));
const RegisterPage = lazy(() => import('src/pages/auth/register'));
const ForgotPasswordPage = lazy(() => import('src/pages/auth/forgot-password'));
const ForgotPasswordAdminPage = lazy(() => import('src/pages/auth/forgot-password-admin'));
const NewPasswordAdminPage = lazy(() => import('src/pages/auth/new-password-admin'));
const VerifyOtpPage = lazy(() => import('src/pages/auth/verify-otp'));
const VerifyOtpAdminPage = lazy(() => import('src/pages/auth/verify-otp-admin'));

export const bankDynamicRoutes: RouteObject[] = [
  // ============================================================================
  // CUSTOMER DYNAMIC ROUTES (with bank_slug)
  // ============================================================================
  {
    path: ':bank_slug/register',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <RegisterPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
  {
    path: ':bank_slug/login',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <SignInCustomerPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
  {
    path: ':bank_slug/forgot-password',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <ForgotPasswordPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
  {
    path: ':bank_slug/verify-otp',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <VerifyOtpPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },

  // ============================================================================
  // ADMIN DYNAMIC ROUTES (with bank_slug)
  // ============================================================================
  {
    path: ':bank_slug/admin/login',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <SignInAdminPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
  {
    path: ':bank_slug/admin/forgot-password',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <ForgotPasswordAdminPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
  {
    path: ':bank_slug/admin/verify-otp',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <VerifyOtpAdminPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
  {
    path: ':bank_slug/admin/new-password',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <NewPasswordAdminPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },
];

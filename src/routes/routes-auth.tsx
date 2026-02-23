/**
 * Authentication Routes
 * Public routes for login, register, and password reset
 */

import type { RouteObject } from 'react-router';

import { lazy } from 'react';

import { AuthLayout } from 'src/layouts/auth';

import { AuthRouteGuard } from 'src/components/auth';

// Import pages directly from their source, not from sections (avoid circular deps)
const SignInSuperAdminPage = lazy(() => import('src/pages/auth/sign-in-superadmin'));
const SignInAdminPage = lazy(() => import('src/pages/auth/sign-in-admin'));
const SignInCustomerPage = lazy(() => import('src/pages/auth/sign-in-customer'));
const SignInPage = lazy(() => import('src/pages/auth/sign-in'));
const RegisterPage = lazy(() => import('src/pages/auth/register'));
const ForgotPasswordPage = lazy(() => import('src/pages/auth/forgot-password'));
const ForgotPasswordAdminPage = lazy(() => import('src/pages/auth/forgot-password-admin'));
const VerifyOtpPage = lazy(() => import('src/pages/auth/verify-otp'));
const VerifyOtpAdminPage = lazy(() => import('src/pages/auth/verify-otp-admin'));
const ResetPasswordPage = lazy(() => import('src/pages/auth/reset-password'));

export const authRoutes: RouteObject[] = [
  // SUPER ADMIN AUTH
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

  // ADMIN AUTH
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
    path: 'admin/new-password',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <ResetPasswordPage />
        </AuthLayout>
      </AuthRouteGuard>
    ),
  },

  // CUSTOMER AUTH (single sign-in; API returns bank slug after login)
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
    path: 'reset-password',
    element: (
      <AuthRouteGuard>
        <AuthLayout>
          <ResetPasswordPage />
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
];

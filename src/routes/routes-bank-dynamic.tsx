/**
 * Dynamic Bank Routes
 * Bank slug is used only for customer registration (to link customer to bank in DB).
 * All other auth (sign-in, forgot-password, verify-otp, admin flows) use routes-auth.tsx without bank slug.
 */

import type { RouteObject } from 'react-router';

import { lazy } from 'react';

import { AuthLayout } from 'src/layouts/auth';

import { AuthRouteGuard } from 'src/components/auth';

const RegisterPage = lazy(() => import('src/pages/auth/register'));

export const bankDynamicRoutes: RouteObject[] = [
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
];

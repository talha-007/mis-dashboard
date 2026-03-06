/**
 * AuthRouteGuard
 * Simple wrapper for auth pages (login, register, etc.).
 * If the user is already authenticated, it immediately redirects to the dashboard
 * before rendering the auth page, avoiding any flash of the auth UI.
 */

import type { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { getUserHomePath } from 'src/utils/role-home-path';

import { useAppSelector } from 'src/store';

interface AuthRouteGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function AuthRouteGuard({ children, redirectTo = '/' }: AuthRouteGuardProps) {
  const { isAuthenticated, isInitialized, isLoading, user } = useAppSelector(
    (state) => state.auth
  );

  // Wait until auth is fully settled before deciding to redirect.
  // Redirecting while isLoading=true (e.g. during login) causes the sign-in
  // page to be torn down mid-flight and creates an infinite redirect loop.
  if (!isInitialized || isLoading) {
    return <>{children}</>;
  }

  if (isAuthenticated && user) {
    const target = redirectTo || getUserHomePath(user);
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}

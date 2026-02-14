/**
 * Guest Only Route Component
 * Redirects authenticated users away from auth pages to their dashboards.
 */

import type { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { getUserHomePath } from 'src/utils/role-home-path';
import { isAuthenticated as hasStoredToken } from 'src/utils/auth-storage';

import { useAppSelector } from 'src/store';

interface GuestOnlyRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function GuestOnlyRoute({ children, redirectTo }: GuestOnlyRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const effectiveAuthenticated = isAuthenticated || hasStoredToken();

  const getDefaultRedirect = () => getUserHomePath(user) || '/';

  // If user is authenticated, redirect them away from auth routes
  if (effectiveAuthenticated) {
    return <Navigate to={redirectTo || getDefaultRedirect()} replace />;
  }

  // If not authenticated, render the auth page
  return <>{children}</>;
}

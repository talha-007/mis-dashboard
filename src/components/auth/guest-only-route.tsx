/**
 * Guest Only Route Component
 * Redirects authenticated users away from auth pages to their dashboards.
 */

import type { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { isAuthenticated as hasStoredToken } from 'src/utils/auth-storage';

import { useAppSelector } from 'src/store';

import { UserRole } from 'src/types/auth.types';

interface GuestOnlyRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function GuestOnlyRoute({ children, redirectTo }: GuestOnlyRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const effectiveAuthenticated = isAuthenticated || hasStoredToken();

  // Determine default dashboard per role
  const getDefaultRedirect = () => {
    switch (user?.role) {
      case UserRole.SUPER_ADMIN:
        return '/dashboard'; // Super admin home
      case UserRole.ADMIN:
        return '/dashboard'; // Admin home (can be customized later)
      case UserRole.CUSTOMER:
        return '/dashboard'; // Customer home (can be customized later)
      default:
        return '/dashboard';
    }
  };

  // If user is authenticated, redirect them away from auth routes
  if (effectiveAuthenticated) {
    return <Navigate to={redirectTo || getDefaultRedirect()} replace />;
  }

  // If not authenticated, render the auth page
  return <>{children}</>;
}

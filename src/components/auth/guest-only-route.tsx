/**
 * Guest Only Route Component
 * Redirects authenticated users to dashboard
 */

import type { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { useAppSelector } from 'src/store';

interface GuestOnlyRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Only renders children if user is NOT authenticated
 * Redirects authenticated users to specified route (default: '/')
 */
export function GuestOnlyRoute({ children, redirectTo = '/' }: GuestOnlyRouteProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

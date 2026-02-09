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
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    const target = redirectTo || getUserHomePath(user);
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}


/**
 * Customer Home Redirect
 * When user is a customer with bankSlug, redirect from / to /:bank_slug so they use dynamic customer routes.
 */

import type { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { useAppSelector } from 'src/store';

import { UserRole } from 'src/types/auth.types';

interface CustomerHomeRedirectProps {
  children: ReactNode;
}

export function CustomerHomeRedirect({ children }: CustomerHomeRedirectProps) {
  const { user } = useAppSelector((state) => state.auth);

  if (user?.role === UserRole.CUSTOMER && user?.bankSlug) {
    return <Navigate to={`/${user.bankSlug}`} replace />;
  }

  return <>{children}</>;
}

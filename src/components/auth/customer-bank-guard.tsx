/**
 * Customer Bank Guard
 * Only allows CUSTOMER role to access routes under /:bank_slug (dynamic customer routes).
 * Redirects others to home.
 */

import type { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { useAppSelector } from 'src/store';

import { UserRole } from 'src/types/auth.types';

interface CustomerBankGuardProps {
  children: ReactNode;
}

export function CustomerBankGuard({ children }: CustomerBankGuardProps) {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (user.role !== UserRole.CUSTOMER) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/**
 * Subscription Guard
 * Bank admin: redirect to subscription-required if subscription is not active.
 * Other roles: render children.
 */

import type { ReactNode } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { useAppSelector } from 'src/store';

import { needsSubscription } from 'src/types/auth.types';

interface SubscriptionGuardProps {
  children: ReactNode;
}

const SUBSCRIPTION_REQUIRED_PATH = '/subscription-required';

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const isOnSubscriptionPage = location.pathname === SUBSCRIPTION_REQUIRED_PATH;

  if (needsSubscription(user) && !isOnSubscriptionPage) {
    return <Navigate to={SUBSCRIPTION_REQUIRED_PATH} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

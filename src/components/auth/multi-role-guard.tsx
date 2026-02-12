/**
 * Multi Role Guard Component
 * Allows access if user has ANY of the specified roles
 */

import type { ReactNode } from 'react';
import type { UserRole, Permission } from 'src/types/auth.types';

import { Navigate } from 'react-router-dom';

import { useAppSelector } from 'src/store';

import { hasRole, hasPermission } from 'src/types/auth.types';

interface MultiRoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  allowedPermissions?: Permission[];
  fallback?: ReactNode;
}

/**
 * Renders children if user has ANY of the allowed roles or permissions
 * Redirects to /unauthorized if access is denied
 */
export function MultiRoleGuard({
  children,
  allowedRoles,
  allowedPermissions,
  fallback,
}: MultiRoleGuardProps) {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
  }

  // Check if user has any of the allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAnyRole = allowedRoles.some((role) => hasRole(user, role));
    if (!hasAnyRole) {
      return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
    }
  }

  // Check if user has any of the allowed permissions
  if (allowedPermissions && allowedPermissions.length > 0) {
    const hasAnyPermission = allowedPermissions.some((permission) =>
      hasPermission(user, permission)
    );
    if (!hasAnyPermission) {
      return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}

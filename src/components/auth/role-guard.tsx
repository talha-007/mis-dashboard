/**
 * Role Guard Component
 * Conditionally renders content based on user role/permissions
 */

import type { ReactNode } from 'react';
import type { UserRole, Permission } from 'src/types/auth.types';

import { Navigate } from 'react-router-dom';

import { useAppSelector } from 'src/store';

import { hasRole, hasPermission } from 'src/types/auth.types';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: Permission;
  fallback?: ReactNode;
}

/**
 * Renders children only if user has required role or permission
 * Redirects to /unauthorized if access is denied
 */
export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  fallback,
}: RoleGuardProps) {
  const { user } = useAppSelector((state) => state.auth);
  console.log('user', user);

  // Check role requirement
  if (requiredRole && !hasRole(user, requiredRole)) {
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Convenience components for common cases
export function SuperAdminOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard requiredRole={'superadmin' as UserRole} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function CustomerOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard requiredRole={'customer' as UserRole} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

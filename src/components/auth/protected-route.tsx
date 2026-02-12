/**
 * Protected Route Component
 * Restricts access based on authentication and roles
 */

import type { ReactNode } from 'react';
import type { UserRole, Permission } from 'src/types/auth.types';

import { Navigate, useLocation } from 'react-router-dom';

import { Box, CircularProgress } from '@mui/material';

import { useAppSelector } from 'src/store';

import { hasRole, hasPermission } from 'src/types/auth.types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: Permission;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  console.log('[ProtectedRoute] Auth state:', {
    isAuthenticated,
    user,
    isLoading,
    pathname: location.pathname,
  });

  // Show loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to /sign-in');
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && !hasRole(user, requiredRole)) {
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
  }

  // All checks passed - render children
  return <>{children}</>;
}

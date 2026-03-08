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
  const { user, isAuthenticated, isLoading, isInitialized } = useAppSelector((state) => state.auth);

  // Wait for the one-time startup auth check before making any routing decisions.
  // Also wait while an active loading operation is in progress to avoid
  // redirecting on the basis of a temporarily stale auth state.
  if (!isInitialized || isLoading) {
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

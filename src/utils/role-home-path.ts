import type { User, UserRole } from 'src/types/auth.types';

// Map each role to its default dashboard home path
export const getRoleHomePath = (role?: UserRole | null): string => {
  switch (role) {
    case 'superadmin':
      return '/bank-management';
    case 'admin':
      return '/borrower-management';
    case 'customer':
      return '/';
    case 'recovery_officer':
      return '/employee/recovery-dashboard';
    default:
      return '/';
  }
};

export const getUserHomePath = (user?: User | null): string => getRoleHomePath(user?.role ?? null);

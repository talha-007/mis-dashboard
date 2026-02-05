import type { User, UserRole } from 'src/types/auth.types';

// Map each role to its default dashboard home path
export const getRoleHomePath = (role?: UserRole | null): string => {
  switch (role) {
    case 'superadmin':
      return '/bank-management'; // Super admin main area
    case 'admin':
      return '/borrower-management'; // Admin main area
    case 'customer':
      return '/apply-loan'; // Customer main area
    default:
      return '/'; // Fallback to generic dashboard
  }
};

export const getUserHomePath = (user?: User | null): string =>
  getRoleHomePath(user?.role ?? null);


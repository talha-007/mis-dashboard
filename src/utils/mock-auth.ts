/**
 * Mock Authentication Utilities
 * Used for development when backend is not available
 */

import type { User } from 'src/types/auth.types';

import { UserRole, Permission } from 'src/types/auth.types';

export const MOCK_USERS: Record<'superadmin' | 'admin' | 'customer', User> = {
  superadmin: {
    id: 'mock-superadmin-001',
    email: 'admin@mis.local',
    firstName: 'Super',
    lastName: 'Admin',
    role: UserRole.SUPER_ADMIN,
    permissions: Object.values(Permission), // All permissions
    isActive: true,
    isEmailVerified: true,
    avatar: '/assets/images/avatars/avatar_default.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  admin: {
    id: 'mock-admin-001',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    permissions: [
      Permission.VIEW_USERS,
      Permission.VIEW_ACCOUNTS,
      Permission.CREATE_ACCOUNTS,
      Permission.EDIT_ACCOUNTS,
      Permission.APPROVE_ACCOUNTS,
      Permission.VIEW_TRANSACTIONS,
      Permission.CREATE_TRANSACTIONS,
      Permission.APPROVE_TRANSACTIONS,
      Permission.VIEW_LOANS,
      Permission.CREATE_LOANS,
      Permission.APPROVE_LOANS,
      Permission.REJECT_LOANS,
      Permission.VIEW_REPORTS,
      Permission.EXPORT_REPORTS,
    ],
    isActive: true,
    isEmailVerified: true,
    avatar: '/assets/images/avatars/avatar_default.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  customer: {
    id: 'mock-customer-001',
    email: 'customer@mis.local',
    firstName: 'Test',
    lastName: 'Customer',
    role: UserRole.CUSTOMER,
    permissions: [
      Permission.VIEW_ACCOUNTS,
      Permission.VIEW_TRANSACTIONS,
      Permission.VIEW_LOANS,
      Permission.CREATE_LOANS,
    ],
    isActive: true,
    isEmailVerified: true,
    avatar: '/assets/images/avatars/avatar_default.jpg',
    accountNumber: 'ACC-001',
    customerType: 'individual',
    kycStatus: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export const MOCK_TOKEN = 'mock-jwt-token-for-development';
export const MOCK_REFRESH_TOKEN = 'mock-refresh-token-for-development';

export function getMockUser(role: 'superadmin' | 'admin' | 'customer' = 'superadmin'): User {
  return MOCK_USERS[role];
}

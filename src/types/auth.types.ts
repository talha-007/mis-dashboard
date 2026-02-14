/**
 * Authentication and RBAC Types
 * Microfinance Bank Dashboard
 */

// User Roles
export enum UserRole {
  SUPER_ADMIN = 'superadmin',
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

// Permissions
export enum Permission {
  // User Management
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',

  // Account Management
  VIEW_ACCOUNTS = 'view_accounts',
  CREATE_ACCOUNTS = 'create_accounts',
  EDIT_ACCOUNTS = 'edit_accounts',
  DELETE_ACCOUNTS = 'delete_accounts',
  APPROVE_ACCOUNTS = 'approve_accounts',

  // Transaction Management
  VIEW_TRANSACTIONS = 'view_transactions',
  CREATE_TRANSACTIONS = 'create_transactions',
  APPROVE_TRANSACTIONS = 'approve_transactions',

  // Loan Management
  VIEW_LOANS = 'view_loans',
  CREATE_LOANS = 'create_loans',
  APPROVE_LOANS = 'approve_loans',
  REJECT_LOANS = 'reject_loans',

  // Reports
  VIEW_REPORTS = 'view_reports',
  EXPORT_REPORTS = 'export_reports',

  // Settings
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
}

// Role Permissions Mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // All permissions
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.VIEW_ACCOUNTS,
    Permission.CREATE_ACCOUNTS,
    Permission.EDIT_ACCOUNTS,
    Permission.DELETE_ACCOUNTS,
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
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_AUDIT_LOGS,
  ],
  [UserRole.ADMIN]: [
    // Admin permissions (no user management or settings)
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
  [UserRole.CUSTOMER]: [
    // Limited customer permissions
    Permission.VIEW_ACCOUNTS,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_LOANS,
    Permission.CREATE_LOANS,
  ],
};

// User Interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string;
  phoneNumber?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;

  // Customer specific fields
  accountNumber?: string;
  customerType?: 'individual' | 'business';
  kycStatus?: 'pending' | 'approved' | 'rejected';

  // Bank admin: subscription status (from /me API)
  subscriptionStatus?: 'active' | 'inactive';
}

// Auth Response
export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

// Login Credentials
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Google Login
export interface GoogleLoginCredentials {
  credential: string; // Google ID token
}

// Register Data
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
  customerType?: 'individual' | 'business';
}

// Helper function to check permissions
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) return false;
  const permissions = user.permissions ?? [];
  return Array.isArray(permissions) && permissions.includes(permission);
};

// Helper function to check role
export const hasRole = (user: User | null, role: UserRole): boolean => {
  if (!user) return false;
  return user.role === role;
};

// Helper function to check if user is super admin
export const isSuperAdmin = (user: User | null): boolean => hasRole(user, UserRole.SUPER_ADMIN);

// Helper function to check if user is admin
export const isAdmin = (user: User | null): boolean => hasRole(user, UserRole.ADMIN);

// Helper function to check if user is customer
export const isCustomer = (user: User | null): boolean => hasRole(user, UserRole.CUSTOMER);

/** Bank admin subscription: active = can access dashboard; inactive = must pay first */
export const isSubscriptionActive = (user: User | null): boolean => {
  if (!user) return false;
  if (user.role !== UserRole.ADMIN) return true; // Super admin & customer not restricted
  return (user.subscriptionStatus ?? 'inactive') === 'active';
};

/** True if user is bank admin and must complete subscription before accessing pages */
export const needsSubscription = (user: User | null): boolean =>
  !!user && user.role === UserRole.ADMIN && (user.subscriptionStatus ?? 'inactive') !== 'active';

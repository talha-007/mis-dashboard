/**
 * API Services Export
 * Centralized export for all API services
 */

export { authService } from './auth.service';
export { usersService } from './users.service';

// Re-export types from auth.types for convenience
export type {
  User,
  UserRole,
  Permission,
  RegisterData,
  AuthResponse,
  LoginCredentials,
  GoogleLoginCredentials,
} from 'src/types/auth.types';

// Add more service exports as you create them
// export * from './products.service';
// export * from './orders.service';
// export * from './analytics.service';

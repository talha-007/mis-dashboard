/**
 * useAuth Hook
 * Custom hook for authentication operations
 */

import type { RegisterData, LoginCredentials } from 'src/types/auth.types';

import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from 'src/store';
import {
  logout,
  register,
  userLogin,
  adminLogin,
  googleLogin,
  getCurrentUser,
  initializeAuth,
  superAdminLogin,
} from 'src/redux/slice/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // .unwrap() returns a Promise that will reject if the async thunk was rejected
  // This allows proper error handling in components
  const handleSuperAdminLogin = useCallback(
    async (credentials: LoginCredentials) => dispatch(superAdminLogin(credentials)).unwrap(),
    [dispatch]
  );

  const handleAdminLogin = useCallback(
    async (credentials: LoginCredentials) => dispatch(adminLogin(credentials)).unwrap(),
    [dispatch]
  );

  const handleUserLogin = useCallback(
    async (credentials: LoginCredentials) => dispatch(userLogin(credentials)).unwrap(),
    [dispatch]
  );

  const handleGoogleLogin = useCallback(
    async (idToken: string) => dispatch(googleLogin({ idToken })).unwrap(),
    [dispatch]
  );

  const handleRegister = useCallback(
    async (data: RegisterData) => dispatch(register(data)).unwrap(),
    [dispatch]
  );

  const handleLogout = useCallback(async () => dispatch(logout({})).unwrap(), [dispatch]);

  const refreshUser = useCallback(async () => dispatch(getCurrentUser()).unwrap(), [dispatch]);

  const initialize = useCallback(async () => dispatch(initializeAuth()).unwrap(), [dispatch]);

  return {
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    isInitialized: auth.isInitialized,
    isLoggingIn: auth.isLoggingIn,

    // Actions
    loginSuperAdmin: handleSuperAdminLogin,
    loginAdmin: handleAdminLogin,
    loginUser: handleUserLogin,
    loginWithGoogle: handleGoogleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser,
    initialize,
  };
};

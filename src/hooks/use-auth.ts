/**
 * useAuth Hook
 * Custom hook for authentication operations
 */

import type { RegisterData, LoginCredentials } from 'src/services/api';

import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from 'src/store';
import { login, logout, register, getCurrentUser } from 'src/store/slices/auth.slice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // .unwrap() returns a Promise that will reject if the async thunk was rejected
  // This allows proper error handling in components
  const handleLogin = useCallback(
    async (credentials: LoginCredentials) =>
      dispatch(login(credentials)).unwrap(),
    [dispatch]
  );

  const handleRegister = useCallback(
    async (data: RegisterData) =>
      dispatch(register(data)).unwrap(),
    [dispatch]
  );

  const handleLogout = useCallback(
    async () => dispatch(logout()).unwrap(),
    [dispatch]
  );

  const refreshUser = useCallback(
    async () => dispatch(getCurrentUser()).unwrap(),
    [dispatch]
  );

  return {
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    
    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser,
  };
};

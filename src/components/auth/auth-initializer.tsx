/**
 * Auth Initializer Component
 * Handles authentication state initialization on app startup
 */

import type { ReactNode } from 'react';

import { useEffect } from 'react';

import Box from '@mui/material/Box';
import { CircularProgress } from '@mui/material';

import { useAppDispatch, useAppSelector } from 'src/store';
import { initializeAuth } from 'src/redux/slice/authSlice';

interface AuthInitializerProps {
  children: ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const dispatch = useAppDispatch();
  const { isInitialized, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return <>{children}</>;
}

/**
 * Google OAuth Provider
 * Wraps the app with Google OAuth context
 */

import type { ReactNode } from 'react';

import { GoogleOAuthProvider } from '@react-oauth/google';

// Get Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface GoogleOAuthWrapperProps {
  children: ReactNode;
}

export function GoogleOAuthWrapper({ children }: GoogleOAuthWrapperProps) {
  // Only wrap with Google OAuth if client ID is available
  if (!GOOGLE_CLIENT_ID) {
    console.warn('Google Client ID not found. Google Sign-In will not work.');
    return <>{children}</>;
  }

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
}

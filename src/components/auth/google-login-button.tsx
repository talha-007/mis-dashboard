/**
 * Google Login Button Component (Firebase)
 * Uses Firebase Web SDK to get an ID token, then calls backend /api/customers/google-login.
 */

import type { ButtonProps } from '@mui/material';
import { Button } from '@mui/material';

import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { initializeApp, type FirebaseApp } from 'firebase/app';

import { useAuth } from 'src/hooks';

import { Iconify } from 'src/components/iconify';

// Firebase config provided by user
const firebaseConfig = {
  apiKey: 'AIzaSyDatVWe2sdBMudH-Pzy9-qRZNKXgp2_LDg',
  authDomain: 'mona-ai-8903f.firebaseapp.com',
  projectId: 'mona-ai-8903f',
  storageBucket: 'mona-ai-8903f.firebasestorage.app',
  messagingSenderId: '157321413851',
  appId: '1:157321413851:web:4091929b2a55a2669b78fe',
};

let firebaseApp: FirebaseApp | null = null;

const getFirebaseApp = () => {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
  }
  return firebaseApp;
};

interface GoogleLoginButtonProps extends Omit<ButtonProps, 'onClick'> {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  children,
  ...buttonProps
}: GoogleLoginButtonProps) {
  const { loginWithGoogle } = useAuth();

  const handleClick = async () => {
    try {
      const app = getFirebaseApp();
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      await loginWithGoogle(idToken);
      onSuccess?.();
    } catch (error) {
      console.error('Google login failed:', error);
      onError?.(error);
    }
  };

  return (
    <Button
      fullWidth
      size="large"
      variant="outlined"
      color="inherit"
      startIcon={<Iconify icon="eva:google-fill" width={24} />}
      onClick={handleClick}
      {...buttonProps}
    >
      {children || 'Continue with Google'}
    </Button>
  );
}

/**
 * Google Login Button Component
 */

import { useGoogleLogin } from '@react-oauth/google';

import { Button, type ButtonProps } from '@mui/material';

import { useAppDispatch } from 'src/store';
// TODO: Add Google login support when needed
// import { loginWithGoogle } from 'src/redux/slice/authSlice';

import { Iconify } from 'src/components/iconify';

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
  const dispatch = useAppDispatch();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // TODO: Implement Google login when backend supports it
        console.log('Google login token:', tokenResponse);
        // await dispatch(loginWithGoogle({ credential: tokenResponse.access_token })).unwrap();
        onSuccess?.();
      } catch (error) {
        console.error('Google login failed:', error);
        onError?.(error);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      onError?.(error);
    },
  });

  return (
    <Button
      fullWidth
      size="large"
      variant="outlined"
      color="inherit"
      startIcon={<Iconify icon="eva:google-fill" width={24} />}
      onClick={() => handleGoogleLogin()}
      {...buttonProps}
    >
      {children || 'Continue with Google'}
    </Button>
  );
}

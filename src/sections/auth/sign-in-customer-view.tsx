/**
 * Customer Sign In View
 */

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/hooks';

import { Iconify } from 'src/components/iconify';
import { GoogleLoginButton } from 'src/components/auth';

// ----------------------------------------------------------------------

export function SignInCustomerView() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await login({
          email: formData.email,
          password: formData.password,
          rememberMe: true,
        });
        router.push('/');
      } catch (err) {
        console.error('Login failed:', err);
      }
    },
    [formData, login, router]
  );

  const handleGoogleSuccess = useCallback(() => {
    router.push('/');
  }, [router]);

  const renderForm = (
    <Stack spacing={3} component="form" onSubmit={handleSignIn}>
      {error && (
        <Alert 
          severity="error"
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        required
        name="email"
        type="email"
        label="Email Address"
        placeholder="customer@example.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        disabled={isLoading}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:email-outline" width={20} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <Stack spacing={1.5}>
        <TextField
          fullWidth
          required
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          disabled={isLoading}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:lock-outline" width={20} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <Box textAlign="right">
          <Link
            variant="body2"
            fontWeight={600}
            onClick={() => router.push('/forgot-password')}
            sx={{ cursor: 'pointer' }}
          >
            Forgot password?
          </Link>
        </Box>
      </Stack>

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        disabled={isLoading}
        sx={{
          mt: 1,
          py: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
        }}
      >
        {isLoading ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} color="inherit" />
            <span>Signing in...</span>
          </Stack>
        ) : (
          'Sign In'
        )}
      </Button>
    </Stack>
  );

  return (
    <Stack spacing={4}>
      
      {/* Header */}
      <Stack spacing={2} alignItems="center">
        <Box
          sx={{
            width: 72,
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            bgcolor: (theme) => theme.palette.primary.lighter,
            color: 'primary.main',
          }}
        >
          <Iconify icon="solar:user-bold-duotone" width={40} />
        </Box>
        
        <Stack spacing={1} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4" fontWeight={700}>
              Customer Login
            </Typography>
          
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Sign in to access your account
          </Typography>
        </Stack>
      </Stack>

      {/* Sign In Form */}
      {renderForm}

      {/* Divider */}
      <Divider sx={{ '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography variant="body2" sx={{ color: 'text.disabled', px: 2 }}>
          or continue with
        </Typography>
      </Divider>

      {/* Google Sign In */}
      <GoogleLoginButton 
        onSuccess={handleGoogleSuccess} 
        disabled={isLoading}
        sx={{
          borderRadius: 2,
          py: 1.5,
          fontSize: '0.95rem',
          textTransform: 'none',
          fontWeight: 500,
        }}
      />

      {/* Footer */}
      <Stack spacing={2}>
        <Divider />
        
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary" display="inline">
            Don&apos;t have an account?{' '}
          </Typography>
          <Link
            variant="body2"
            fontWeight={600}
            onClick={() => router.push('/register')}
            sx={{ cursor: 'pointer' }}
          >
            Get Started
          </Link>
        </Box>
      </Stack>
    </Stack>
  );
}

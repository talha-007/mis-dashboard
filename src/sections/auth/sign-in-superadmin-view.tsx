/**
 * Super Admin Sign In View
 */

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/hooks';
import { useAppDispatch } from 'src/store';
import { setLoggingIn } from 'src/redux/slice/authSlice';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInSuperAdminView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loginSuperAdmin, isLoading, error } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSignIn = useCallback(
    async (e?: React.FormEvent | React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      if (submitting || isLoading) return;

      setSubmitting(true);
      try {
        await loginSuperAdmin({
          email: formData.email,
          password: formData.password,
          rememberMe: true,
        });
        // Wait a bit to ensure Redux state has fully updated and UI has rendered
        // This prevents layout from changing before API response is fully processed
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Clear the logging in flag and navigate
        dispatch(setLoggingIn(false));
        router.push('/');
      } catch (err) {
        console.error('Login failed:', err);
        // Clear the logging in flag on error
        dispatch(setLoggingIn(false));
        // Don't navigate on error - stay on login page
      } finally {
        setSubmitting(false);
      }
    },
    [formData, loginSuperAdmin, router, submitting, isLoading, dispatch]
  );

  const renderForm = (
    <Stack 
      spacing={3} 
      component="form" 
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSignIn(e);
      }}
      noValidate
    >
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
        placeholder="admin@mis.local"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        disabled={submitting || isLoading}
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
          disabled={submitting || isLoading}
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

        {/* <Box textAlign="right">
          <Link
            variant="body2"
            fontWeight={600}
            onClick={() => router.push('/forgot-password')}
            sx={{ cursor: 'pointer' }}
          >
            Forgot password?
          </Link>
        </Box> */}
      </Stack>

      <Button
        fullWidth
        size="large"
        type="button"
        variant="contained"
        disabled={submitting || isLoading}
        onClick={handleSignIn}
        sx={{
          mt: 1,
          py: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        }}
      >
        {submitting ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} color="inherit" />
            <span>Signing in...</span>
          </Stack>
        ) : (
          'Sign In as Super Admin'
        )}
      </Button>
    </Stack>
  );

  return (
    <Stack spacing={4}>
      {/* Back Button */}
     

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
          <Iconify icon="solar:shield-star-bold-duotone" width={40} />
        </Box>
        
        <Stack spacing={1} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4" fontWeight={700}>
              Super Admin Login
            </Typography>
            {/* <Chip 
              label="Full Access" 
              size="small" 
              color="primary" 
              sx={{ fontWeight: 600 }}
            /> */}
          </Stack>
        
        </Stack>
      </Stack>

      {/* Sign In Form */}
      {renderForm}
    </Stack>
  );
}

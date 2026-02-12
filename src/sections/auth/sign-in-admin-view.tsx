/**
 * Admin Sign In View
 */

import { toast } from 'react-toastify';
import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';
import { useBankContext } from 'src/utils/bank-context';

import { getUserHomePath } from 'src/utils/role-home-path';

import { useAuth } from 'src/hooks';
import { setLoggingIn } from 'src/redux/slice/authSlice';
import { useAppDispatch, useAppSelector } from 'src/store';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInAdminView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { loginAdmin, isLoading, error } = useAuth();
  const { bankSlug, initializeBankContext } = useBankContext();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Initialize bank context when bank_slug is present
  useEffect(() => {
    if (bankSlug) {
      initializeBankContext();
    }
  }, [bankSlug, initializeBankContext]);

  const handleSignIn = useCallback(
    async (e?: React.FormEvent | React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      try {
        setSubmitting(true);
        const response = await loginAdmin({
          email: formData.email,
          password: formData.password,
          rememberMe: true,
        });
        if (response) {
          const userObj = (response as any).user || (response as any).bank;
          const homePath = getUserHomePath(userObj);
          router.push(homePath);
        }
      } catch (err: any) {
        setSubmitting(false);
        console.error('Login failed:', err);
        const errorMessage = err?.message || 'Login failed. Please try again.';
        toast.error(errorMessage);
        dispatch(setLoggingIn(false));
      }
    },
    [formData, loginAdmin, dispatch]
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
            '& .MuiAlert-message': { width: '100%' },
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
        placeholder="admin@example.com"
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
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
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
            onClick={() => router.push('/admin/forgot-password')}
            sx={{ cursor: 'pointer' }}
          >
            Forgot password?
          </Link>
        </Box>
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
        }}
      >
        {submitting ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} color="inherit" />
            <span>Signing in...</span>
          </Stack>
        ) : (
          'Sign In as Admin'
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
            bgcolor: '#4D0CE7',
            color: '#ffffff',
          }}
        >
          <Iconify icon="solar:user-id-bold-duotone" width={40} />
        </Box>

        <Stack spacing={1} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4" fontWeight={700}>
              Admin Login
            </Typography>
            <Chip
              label="Operations"
              size="small"
              sx={{
                bgcolor: '#4D0CE7',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Sign in to manage operations
          </Typography>
        </Stack>
      </Stack>

      {/* Sign In Form */}
      {renderForm}
    </Stack>
  );
}

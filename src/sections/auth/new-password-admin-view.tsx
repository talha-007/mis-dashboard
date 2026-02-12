/**
 * New Password Admin View
 * Reset password page for admin users
 */

import { toast } from 'react-toastify';
import { useState, useCallback } from 'react';

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

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useAppSelector } from 'src/store';
import authService from 'src/redux/services/auth.services';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function NewPasswordAdminView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);

  // Get email from URL params (passed from verify-otp-admin) or Redux state
  const emailFromParams = searchParams.get('email') || '';
  const emailToUse = emailFromParams || user?.email || '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const validateForm = (): boolean => {
    setError(null);

    if (!formData.newPassword.trim()) {
      setError('New password is required');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (!formData.confirmPassword.trim()) {
      setError('Please confirm your password');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleResetPassword = useCallback(
    async (e?: React.FormEvent | React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!validateForm()) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const payload = {
          email: emailToUse,
          newPassword: formData.newPassword,
        };

        await authService.newPasswordAdmin(payload);

        toast.success('Password reset successfully! Redirecting to login...');

        // Redirect to admin login after successful reset
        setTimeout(() => {
          router.push('/sign-in/admin');
        }, 2000);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Failed to reset password';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, emailToUse, router]
  );

  const renderForm = (
    <Stack
      spacing={3}
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleResetPassword(e);
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

      {emailToUse && (
        <TextField
          fullWidth
          disabled
          name="email"
          type="email"
          label="Email Address"
          value={emailToUse}
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
      )}

      <Stack spacing={1.5}>
        <TextField
          fullWidth
          required
          name="newPassword"
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
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

        <TextField
          fullWidth
          required
          name="confirmPassword"
          label="Confirm New Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                  >
                    <Iconify
                      icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                    />
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
            <span>Resetting Password...</span>
          </Stack>
        ) : (
          'Reset Password'
        )}
      </Button>

      <Box textAlign="center">
        <Link
          variant="body2"
          fontWeight={600}
          onClick={() => router.push('/admin/sign-in')}
          sx={{ cursor: 'pointer' }}
        >
          Back to Sign In
        </Link>
      </Box>
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
          <Iconify icon="solar:lock-password-bold-duotone" width={40} />
        </Box>

        <Stack spacing={1} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4" fontWeight={700}>
              Reset Password
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
            Enter your new password to regain access
          </Typography>
        </Stack>
      </Stack>

      {/* Reset Password Form */}
      {renderForm}
    </Stack>
  );
}

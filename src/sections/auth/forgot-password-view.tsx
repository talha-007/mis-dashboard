/**
 * Forgot Password View
 * Request password reset via email/OTP
 */

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { authService } from 'src/services/api';

import { Iconify } from 'src/components/iconify';

export function ForgotPasswordView() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      try {
        await authService.requestPasswordReset({ email });
        setSuccess(true);
        // Redirect to OTP verification after 2 seconds
        setTimeout(() => {
          router.push(`/verify-otp?type=reset&email=${encodeURIComponent(email)}`);
        }, 2000);
      } catch (err: any) {
        setError(err.message || 'Failed to send reset code. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [email, router]
  );

  const renderForm = (
    <Stack spacing={3} component="form" onSubmit={handleSubmit}>
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

      {success && (
        <Alert 
          severity="success"
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          Reset code sent! Check your email for the OTP.
        </Alert>
      )}

      <TextField
        fullWidth
        required
        name="email"
        type="email"
        label="Email Address"
        placeholder="john.doe@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading || success}
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

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        disabled={isLoading || success}
        sx={{
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
        {isLoading ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} color="inherit" />
            <span>Sending...</span>
          </Stack>
        ) : success ? (
          'Code Sent!'
        ) : (
          'Send Reset Code'
        )}
      </Button>

      <Box textAlign="center">
        <Link
          variant="body2"
          fontWeight={600}
          onClick={() => router.push('/sign-in')}
          sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 0.5, 
            cursor: 'pointer' 
          }}
        >
          <Iconify icon="eva:arrow-ios-back-outline" width={16} />
          Back to Sign In
        </Link>
      </Box>
    </Stack>
  );

  return (
    <Stack spacing={4}>
      {/* Header */}
      <Stack spacing={1.5} alignItems="center">
        <Typography variant="h4" fontWeight={700}>
          Forgot Password?
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          No worries! Enter your email and we&apos;ll send you a reset code.
        </Typography>
      </Stack>

      {/* Form */}
      {renderForm}
    </Stack>
  );
}

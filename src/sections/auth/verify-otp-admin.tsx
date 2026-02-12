/**
 * Verify OTP View
 * OTP verification for registration and password reset
 */

import { toast } from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import authService from 'src/redux/services/auth.services';

import { Iconify } from 'src/components/iconify';

export function VerifyOtpAdminView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verificationType = searchParams.get('type') || 'registration'; // 'registration' or 'reset'
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    setResendDisabled(false);
    return undefined;
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = pastedData.split('').slice(0, 6);
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      const otpCode = otp.join('');
      if (otpCode.length !== 6) {
        setError('Please enter all 6 digits');
        return;
      }
      try {
        setIsLoading(true);
        // Verify email for registration
        const response = await authService.verifyEmailAdmin({ otp: otpCode, email });
        console.log('response', response);
        if (response.status === 200) {
          setSuccess(true);
          setTimeout(() => {
            router.push(`/admin/new-password?email=${encodeURIComponent(email)}`);
          }, 2000);
        } else {
          setError(response.data.message);
        }
      } catch (err: any) {
        setError(err.message || 'Invalid or expired OTP. Please try again.');
        setIsLoading(false);
      }
    },
    [otp, email, router]
  );

  const handleResend = useCallback(async () => {
    setError('');

    try {
      const response = await authService.resendOTPAdmin({ email });
      console.log('response', response);
      if (response.status === 200) {
        toast.success(response.data.message);
        setCountdown(60); // 60 second cooldown
        setResendDisabled(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code. Please try again.');
    }
  }, [email]);

  const renderForm = (
    <Stack spacing={3} component="form" onSubmit={handleSubmit}>
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

      {success && (
        <Alert
          severity="success"
          sx={{
            borderRadius: 2,
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          {verificationType === 'registration'
            ? '✓ Account verified! Redirecting to sign in...'
            : '✓ OTP verified! Redirecting to reset password...'}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1, sm: 1.5 },
          justifyContent: 'center',
        }}
      >
        {otp.map((digit, index) => (
          <TextField
            key={index}
            id={`otp-${index}`}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={isLoading || success}
            inputProps={{
              maxLength: 1,
              style: {
                textAlign: 'center',
                fontSize: '1.75rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
              },
            }}
            sx={{
              width: { xs: 48, sm: 56 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&.Mui-focused': {
                  '& fieldset': {
                    borderWidth: 2,
                  },
                },
              },
              '& input': {
                padding: { xs: '14px 0', sm: '16px 0' },
              },
            }}
          />
        ))}
      </Box>

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
            <span>Verifying...</span>
          </Stack>
        ) : success ? (
          'Verified!'
        ) : (
          'Verify Code'
        )}
      </Button>

      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary" display="inline">
          Didn&apos;t receive code?{' '}
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={handleResend}
          disabled={resendDisabled || success}
          sx={{
            minWidth: 'auto',
            fontWeight: 600,
            textTransform: 'none',
            px: 0.5,
          }}
        >
          {resendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
        </Button>
      </Box>

      <Box textAlign="center">
        <Link
          variant="body2"
          fontWeight={600}
          onClick={() => router.push('/sign-in/admin')}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
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
      <Stack spacing={2} alignItems="center">
        <Typography variant="h4" fontWeight={700}>
          Verify Your Account
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {verificationType === 'registration'
            ? 'Enter the 6-digit code sent to your email'
            : 'Enter the 6-digit code sent to your email'}
        </Typography>
        {email && (
          <Chip
            label={email}
            size="small"
            sx={{
              bgcolor: 'action.hover',
              fontWeight: 500,
              fontSize: '0.8125rem',
            }}
          />
        )}
      </Stack>

      {/* Form */}
      {renderForm}
    </Stack>
  );
}

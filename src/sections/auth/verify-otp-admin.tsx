/**
 * Verify OTP Admin View - Formik + Yup validation
 */

import { Form, Formik } from 'formik';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

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

import { verifyOtpSchema } from './validations';

export function VerifyOtpAdminView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationType = searchParams.get('type') || 'registration';
  const email = searchParams.get('email') || '';
  const [success, setSuccess] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
    setResendDisabled(false);
    return undefined;
  }, [countdown]);

  const handleSubmit = async (
    values: { otp: string },
    { setStatus }: { setStatus: (s: any) => void }
  ) => {
    try {
      // Unified API expects { otp, email }
      const response = await authService.verifyEmailAdmin({ otp: values.otp, email });
      if (response.status === 200) {
        setSuccess(true);
        // Pass OTP to reset password page
        setTimeout(
          () =>
            router.push(
              `/admin/new-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(values.otp)}`
            ),
          2000
        );
      } else {
        setStatus({ submitError: (response as any).data?.message || 'Verification failed' });
      }
    } catch (err: any) {
      setStatus({ submitError: err?.message || 'Invalid or expired OTP. Please try again.' });
    }
  };

  const handleResend = async () => {
    try {
      const response = await authService.resendOTPAdmin({ email });
      if (response.status === 200) {
        toast.success((response as any).data?.message);
        setCountdown(60);
        setResendDisabled(true);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend code. Please try again.');
    }
  };

  const otpBoxSx = {
    width: { xs: 48, sm: 56 },
    '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderWidth: 2 } },
    '& input': {
      padding: { xs: '14px 0', sm: '16px 0' },
      textAlign: 'center',
      fontSize: '1.75rem',
      fontWeight: 700,
      letterSpacing: '0.1em',
    },
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h4" fontWeight={700}>
          Verify Your Account
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Enter the 6-digit code sent to your email
        </Typography>
        {email && (
          <Chip
            label={email}
            size="small"
            sx={{ bgcolor: 'action.hover', fontWeight: 500, fontSize: '0.8125rem' }}
          />
        )}
      </Stack>

      <Formik
        initialValues={{ otp: '' }}
        validationSchema={verifyOtpSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur
      >
        {({ values, errors, touched, setFieldValue, isSubmitting, setFieldTouched, status }) => {
          const otpArr = (values.otp || '').padEnd(6, ' ').slice(0, 6).split('');
          const handleOtpChange = (index: number, v: string) => {
            if (v && !/^\d$/.test(v)) return;
            const next = (values.otp || '').split('');
            next[index] = v;
            setFieldValue('otp', next.join('').slice(0, 6));
            if (v && index < 5) document.getElementById(`otp-admin-${index + 1}`)?.focus();
          };
          const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
            if (e.key === 'Backspace' && !otpArr[index] && index > 0)
              document.getElementById(`otp-admin-${index - 1}`)?.focus();
          };
          const handlePaste = (e: React.ClipboardEvent) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
            setFieldValue('otp', pasted);
          };
          return (
            <Form>
              <Stack spacing={3}>
                {(status?.submitError || (errors.otp && touched.otp)) && (
                  <Alert
                    severity="error"
                    sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
                  >
                    {status?.submitError || errors.otp}
                  </Alert>
                )}
                {success && (
                  <Alert
                    severity="success"
                    sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
                  >
                    {verificationType === 'registration'
                      ? '✓ Account verified!'
                      : '✓ OTP verified! Redirecting to reset password...'}
                  </Alert>
                )}
                <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, justifyContent: 'center' }}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <TextField
                      key={index}
                      id={`otp-admin-${index}`}
                      value={otpArr[index] === ' ' ? '' : otpArr[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      onBlur={() => setFieldTouched('otp', true)}
                      disabled={isSubmitting || success}
                      inputProps={{ maxLength: 1 }}
                      sx={otpBoxSx}
                    />
                  ))}
                </Box>
                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || success}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: 'none',
                  }}
                >
                  {isSubmitting ? (
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
                    sx={{ minWidth: 'auto', fontWeight: 600, textTransform: 'none', px: 0.5 }}
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
            </Form>
          );
        }}
      </Formik>
    </Stack>
  );
}

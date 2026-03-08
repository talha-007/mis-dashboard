/**
 * Verify OTP View - Formik + Yup validation
 */

import { Form, Formik } from 'formik';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import authService from 'src/redux/services/auth.services';

import { Iconify } from 'src/components/iconify';

import { verifyOtpSchema } from './validations';

// ----------------------------------------------------------------------

export function VerifyOtpView() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationType = searchParams.get('type') || 'registration';
  const email = searchParams.get('email') || '';

  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
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
      const otpCode = values.otp;
      const verifyData = { otp: otpCode, email };
      if (verificationType === 'registration') {
        await authService.verifyEmail(verifyData);
        setSuccess(true);
        setTimeout(() => router.push('/sign-in'), 2000);
      } else {
        await authService.verifyEmail(verifyData);
        setSuccess(true);
        setTimeout(
          () =>
            router.push(
              `/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otpCode)}`
            ),
          1000
        );
      }
    } catch (err: any) {
      setStatus({ submitError: err?.message || 'Invalid or expired OTP. Please try again.' });
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await authService.requestPasswordReset({ email });
      setCountdown(60);
      setResendDisabled(true);
    } finally {
      setResendLoading(false);
    }
  };

  const otpBoxSx = {
    width: { xs: 48, sm: 54 },
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '&.Mui-focused fieldset': { borderWidth: 2, borderColor: theme.palette.primary.main },
    },
    '& input': {
      padding: { xs: '14px 0', sm: '16px 0' },
      textAlign: 'center',
      fontSize: '1.6rem',
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
  };

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 460,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: theme.customShadows?.z24 || '0 24px 48px rgba(0,0,0,0.18)',
      }}
    >
      {/* Gradient header */}
      <Box
        sx={{
          px: 4,
          pt: 5,
          pb: 4,
          background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: alpha('#fff', 0.06),
          },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha('#fff', 0.15),
            mb: 2,
          }}
        >
          <Iconify icon="solar:inbox-bold-duotone" width={28} sx={{ color: '#fff' }} />
        </Box>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', mb: 0.5 }}>
          Check your email
        </Typography>
        <Typography variant="body2" sx={{ color: alpha('#fff', 0.72) }}>
          We sent a 6-digit verification code to
        </Typography>
        {email && (
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              color: '#fff',
              mt: 0.5,
              px: 1.5,
              py: 0.5,
              display: 'inline-block',
              borderRadius: 1,
              bgcolor: alpha('#fff', 0.15),
            }}
          >
            {email}
          </Typography>
        )}
      </Box>

      {/* Form area */}
      <Box sx={{ px: 4, py: 4 }}>
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
              if (v && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
            };

            const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
              if (e.key === 'Backspace' && !otpArr[index] && index > 0)
                document.getElementById(`otp-${index - 1}`)?.focus();
            };

            const handlePaste = (e: React.ClipboardEvent) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
              setFieldValue('otp', pasted);
            };

            return (
              <Form>
                <Stack spacing={3}>
                  {(status?.submitError || (errors.otp && touched.otp)) && !success && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {status?.submitError || errors.otp}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      {verificationType === 'registration'
                        ? '✓ Account verified! Redirecting…'
                        : '✓ Code verified! Redirecting…'}
                    </Alert>
                  )}

                  {/* OTP boxes */}
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 1.5, textAlign: 'center' }}
                    >
                      Enter verification code
                    </Typography>
                    <Box
                      sx={{ display: 'flex', gap: { xs: 1, sm: 1.25 }, justifyContent: 'center' }}
                    >
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <TextField
                          key={index}
                          id={`otp-${index}`}
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
                  </Box>

                  <Button
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || success || (values.otp?.length ?? 0) < 6}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: 'none',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.32)}`,
                      '&:hover': {
                        boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                      },
                    }}
                  >
                    {isSubmitting ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={18} color="inherit" />
                        <span>Verifying…</span>
                      </Stack>
                    ) : success ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:check-circle-bold" width={18} />
                        <span>Verified!</span>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>Verify Code</span>
                        <Iconify icon="solar:arrow-right-bold" width={18} />
                      </Stack>
                    )}
                  </Button>

                  {/* Resend */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.75,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Didn&apos;t receive it?
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={handleResend}
                      disabled={resendDisabled || resendLoading || success}
                      sx={{
                        minWidth: 'auto',
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 0.5,
                        color: 'primary.main',
                      }}
                    >
                      {resendLoading ? (
                        <CircularProgress size={14} />
                      ) : resendDisabled ? (
                        `Resend in ${countdown}s`
                      ) : (
                        'Resend Code'
                      )}
                    </Button>
                  </Box>

                  <Box textAlign="center">
                    <Link
                      variant="body2"
                      fontWeight={600}
                      onClick={() => router.push('/sign-in')}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'pointer',
                        color: 'primary.main',
                      }}
                    >
                      <Iconify icon="solar:arrow-left-bold" width={16} />
                      Back to Sign In
                    </Link>
                  </Box>
                </Stack>
              </Form>
            );
          }}
        </Formik>
      </Box>
    </Card>
  );
}

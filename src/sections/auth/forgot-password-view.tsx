/**
 * Forgot Password View - Formik + Yup validation
 */

import { useState } from 'react';
import { Form, Formik } from 'formik';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import authService from 'src/redux/services/auth.services';

import { Iconify } from 'src/components/iconify';

import { forgotPasswordSchema } from './validations';

// ----------------------------------------------------------------------

export function ForgotPasswordView() {
  const theme = useTheme();
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (
    values: { email: string },
    { setStatus }: { setStatus: (s: any) => void }
  ) => {
    try {
      await authService.requestPasswordReset({ email: values.email });
      setSuccess(true);
      setTimeout(() => {
        router.push(`/verify-otp?type=reset&email=${encodeURIComponent(values.email)}`);
      }, 2000);
    } catch (err: any) {
      setStatus({ submitError: err?.message || 'Failed to send reset code. Please try again.' });
    }
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
          <Iconify icon="solar:lock-keyhole-bold-duotone" width={28} sx={{ color: '#fff' }} />
        </Box>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', mb: 0.5 }}>
          Forgot password?
        </Typography>
        <Typography variant="body2" sx={{ color: alpha('#fff', 0.72) }}>
          No worries — enter your email and we&apos;ll send you a reset code.
        </Typography>
      </Box>

      {/* Form area */}
      <Box sx={{ px: 4, py: 4 }}>
        <Formik
          initialValues={{ email: '' }}
          validationSchema={forgotPasswordSchema}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, status }) => (
            <Form>
              <Stack spacing={3}>
                {(status?.submitError || (errors.email && touched.email)) && !success && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {status?.submitError || errors.email}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    Reset code sent! Redirecting…
                  </Alert>
                )}

                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  label="Email address"
                  placeholder="you@company.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                  disabled={isSubmitting || success}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify
                            icon="solar:inbox-bold-duotone"
                            width={20}
                            sx={{ color: 'text.disabled' }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || success}
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
                      <span>Sending…</span>
                    </Stack>
                  ) : success ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="solar:check-circle-bold" width={18} />
                      <span>Code Sent!</span>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Send Reset Code</span>
                      <Iconify icon="solar:arrow-right-bold" width={18} />
                    </Stack>
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
          )}
        </Formik>
      </Box>
    </Card>
  );
}

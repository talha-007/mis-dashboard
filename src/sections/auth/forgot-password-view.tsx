/**
 * Forgot Password View - Formik + Yup validation
 */

import { useState } from 'react';
import { Form, Formik } from 'formik';

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

import authService from 'src/redux/services/auth.services';

import { Iconify } from 'src/components/iconify';

import { forgotPasswordSchema } from './validations';

const textFieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

export function ForgotPasswordView() {
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
    <Stack spacing={4}>
      <Stack spacing={1.5} alignItems="center">
        <Typography variant="h4" fontWeight={700}>
          Forgot Password?
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          No worries! Enter your email and we&apos;ll send you a reset code.
        </Typography>
      </Stack>

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
                <Alert
                  severity="error"
                  sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
                >
                  {status?.submitError || errors.email}
                </Alert>
              )}
              {success && (
                <Alert
                  severity="success"
                  sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
                >
                  Reset code sent! Check your email for the OTP.
                </Alert>
              )}
              <TextField
                fullWidth
                name="email"
                type="email"
                label="Email Address"
                placeholder="john.doe@example.com"
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
                          icon="eva:email-outline"
                          width={20}
                          sx={{ color: 'text.disabled' }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={textFieldSx}
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
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                }}
              >
                {isSubmitting ? (
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
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
                >
                  <Iconify icon="eva:arrow-ios-back-outline" width={16} />
                  Back to Sign In
                </Link>
              </Box>
            </Stack>
          </Form>
        )}
      </Formik>
    </Stack>
  );
}

/**
 * New Password Admin View - Formik + Yup validation
 */

import { useState } from 'react';
import { Form, Formik } from 'formik';
import { toast } from 'react-toastify';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
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

import { newPasswordAdminSchema } from './validations';

const textFieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

export function NewPasswordAdminView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const emailFromParams = searchParams.get('email') || '';
  const emailToUse = emailFromParams || user?.email || '';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (values: { newPassword: string; confirmPassword: string }) => {
    try {
      await authService.newPasswordAdmin({
        email: emailToUse,
        newPassword: values.newPassword,
      });
      toast.success('Password reset successfully! Redirecting to login...');
      setTimeout(() => router.push('/sign-in/admin'), 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to reset password';
      toast.error(msg);
      throw err;
    }
  };

  return (
    <Stack spacing={4}>
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
              sx={{ bgcolor: '#4D0CE7', color: 'white', fontWeight: 600 }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Enter your new password to regain access
          </Typography>
        </Stack>
      </Stack>

      <Formik
        initialValues={{ newPassword: '', confirmPassword: '' }}
        validationSchema={newPasswordAdminSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <Stack spacing={3}>
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
              )}
              <TextField
                fullWidth
                name="newPassword"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={values.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.newPassword && errors.newPassword)}
                helperText={touched.newPassword && errors.newPassword}
                disabled={isSubmitting}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify
                          icon="eva:lock-outline"
                          width={20}
                          sx={{ color: 'text.disabled' }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          <Iconify
                            icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={textFieldSx}
              />
              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
                disabled={isSubmitting}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify
                          icon="eva:lock-outline"
                          width={20}
                          sx={{ color: 'text.disabled' }}
                        />
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
                sx={textFieldSx}
              />
              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={isSubmitting}
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
                {isSubmitting ? (
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
                  onClick={() => router.push('/sign-in/admin')}
                  sx={{ cursor: 'pointer' }}
                >
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

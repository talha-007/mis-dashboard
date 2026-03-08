/**
 * Reset Password View - Formik + Yup validation
 * Unified view for both customer and bank admin password reset.
 */

import { useState } from 'react';
import { Form, Formik } from 'formik';
import { toast } from 'react-toastify';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useAppSelector } from 'src/store';
import authService from 'src/redux/services/auth.services';

import { Iconify } from 'src/components/iconify';

import { newPasswordAdminSchema } from './validations';

// ----------------------------------------------------------------------

const PASSWORD_RULES = [
  'At least 8 characters',
  'One uppercase letter',
  'One number or special character',
];

// ----------------------------------------------------------------------

export function ResetPasswordView() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);

  const emailFromParams = searchParams.get('email') || '';
  const otpFromParams = searchParams.get('otp') || '';
  const emailToUse = emailFromParams || user?.email || '';
  const signInPath = '/sign-in';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (values: { newPassword: string; confirmPassword: string }) => {
    try {
      if (!otpFromParams) {
        toast.error('OTP is required. Please go back and verify your OTP again.');
        return;
      }
      await authService.resetPassword({
        email: emailToUse,
        otp: otpFromParams,
        newPassword: values.newPassword,
      });
      toast.success('Password reset successfully! Redirecting…');
      setTimeout(() => router.push(signInPath), 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to reset password';
      toast.error(msg);
      throw err;
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
          <Iconify icon="solar:lock-password-bold-duotone" width={28} sx={{ color: '#fff' }} />
        </Box>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', mb: 0.5 }}>
          Create new password
        </Typography>
        <Typography variant="body2" sx={{ color: alpha('#fff', 0.72) }}>
          Your new password must be different from previous ones.
        </Typography>
      </Box>

      {/* Form area */}
      <Box sx={{ px: 4, py: 4 }}>
        {/* Email display */}
        {emailToUse && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1.25,
              mb: 3,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            }}
          >
            <Iconify
              icon="solar:inbox-bold-duotone"
              width={18}
              sx={{ color: 'primary.main', flexShrink: 0 }}
            />
            <Typography variant="body2" fontWeight={500} color="text.primary" noWrap>
              {emailToUse}
            </Typography>
          </Box>
        )}

        <Formik
          initialValues={{ newPassword: '', confirmPassword: '' }}
          validationSchema={newPasswordAdminSchema}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  name="newPassword"
                  label="New password"
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
                            icon="solar:lock-password-bold-duotone"
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
                              width={20}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Confirm new password"
                  type={showConfirm ? 'text' : 'password'}
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
                            icon="solar:shield-check-bold-duotone"
                            width={20}
                            sx={{ color: 'text.disabled' }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirm(!showConfirm)}
                            edge="end"
                            size="small"
                          >
                            <Iconify
                              icon={showConfirm ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                              width={20}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                {/* Password rules */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ display: 'block', mb: 0.75 }}
                  >
                    Password requirements
                  </Typography>
                  <Stack spacing={0.5}>
                    {PASSWORD_RULES.map((rule) => (
                      <Stack key={rule} direction="row" spacing={0.75} alignItems="center">
                        <Iconify
                          icon="solar:check-circle-bold"
                          width={14}
                          sx={{ color: 'primary.main', flexShrink: 0 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {rule}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
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
                      <span>Resetting…</span>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Reset Password</span>
                      <Iconify icon="solar:arrow-right-bold" width={18} />
                    </Stack>
                  )}
                </Button>

                <Box textAlign="center">
                  <Link
                    variant="body2"
                    fontWeight={600}
                    onClick={() => router.push(signInPath)}
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

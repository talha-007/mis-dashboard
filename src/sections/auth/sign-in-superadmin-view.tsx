/**
 * Super Admin Sign In View - Formik + Yup validation
 */

import { useState } from 'react';

import { Formik, Form } from 'formik';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { getUserHomePath } from 'src/utils/role-home-path';

import { useAuth } from 'src/hooks';
import { setLoggingIn } from 'src/redux/slice/authSlice';
import { useAppDispatch } from 'src/store';

import { Iconify } from 'src/components/iconify';

import { signInSchema } from './validations';

const textFieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

export function SignInSuperAdminView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loginSuperAdmin, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const response = await loginSuperAdmin({
        email: values.email,
        password: values.password,
        rememberMe: true,
      });
      await new Promise((r) => setTimeout(r, 50));
      dispatch(setLoggingIn(false));
      router.push(getUserHomePath(response.user));
    } catch (err) {
      console.error('Login failed:', err);
      dispatch(setLoggingIn(false));
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
            bgcolor: (theme) => theme.palette.primary.lighter,
            color: 'primary.main',
          }}
        >
          <Iconify icon="solar:shield-star-bold-duotone" width={40} />
        </Box>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" fontWeight={700}>
            Super Admin Login
          </Typography>
        </Stack>
      </Stack>

      <Formik initialValues={{ email: '', password: '' }} validationSchema={signInSchema} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <Stack spacing={3}>
              {error && (
                <Alert severity="error" sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}>
                  {error}
                </Alert>
              )}
              <TextField
                fullWidth
                name="email"
                type="email"
                label="Email Address"
                placeholder="admin@mis.local"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.email && errors.email)}
                helperText={touched.email && errors.email}
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
                sx={textFieldSx}
              />
              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.password && errors.password)}
                helperText={touched.password && errors.password}
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
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
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
                disabled={isSubmitting || isLoading}
                sx={{ mt: 1, py: 1.5, borderRadius: 2, fontSize: '1rem', fontWeight: 600, textTransform: 'none', boxShadow: 'none' }}
              >
                {isSubmitting || isLoading ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} color="inherit" />
                    <span>Signing in...</span>
                  </Stack>
                ) : (
                  'Sign In as Super Admin'
                )}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </Stack>
  );
}

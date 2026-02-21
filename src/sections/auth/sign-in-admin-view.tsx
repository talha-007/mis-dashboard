/**
 * Admin Sign In View - Formik + Yup validation
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
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useBankContext } from 'src/utils/bank-context';
import { getUserHomePath } from 'src/utils/role-home-path';

import { useAuth } from 'src/hooks';
import { useAppDispatch } from 'src/store';
import { setLoggingIn } from 'src/redux/slice/authSlice';

import { Iconify } from 'src/components/iconify';

import { signInSchema } from './validations';

const textFieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

export function SignInAdminView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loginAdmin, isLoading, error } = useAuth();
  const { bankSlug, initializeBankContext } = useBankContext();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (bankSlug) initializeBankContext();
  }, [bankSlug, initializeBankContext]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const response = await loginAdmin({
        email: values.email,
        password: values.password,
        rememberMe: true,
      });
      if (response) {
        const userObj = (response as any).user || (response as any).bank;
        router.push(getUserHomePath(userObj));
      }
    } catch (err: any) {
      toast.error(err?.message || 'Login failed. Please try again.');
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
            bgcolor: '#4D0CE7',
            color: '#ffffff',
          }}
        >
          <Iconify icon="solar:user-id-bold-duotone" width={40} />
        </Box>
        <Stack spacing={1} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4" fontWeight={700}>
              Admin Login
            </Typography>
            <Chip
              label="Operations"
              size="small"
              sx={{ bgcolor: '#4D0CE7', color: 'white', fontWeight: 600 }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Sign in to manage operations
          </Typography>
        </Stack>
      </Stack>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={signInSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <Stack spacing={3}>
              {error && (
                <Alert
                  severity="error"
                  sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
                >
                  {error}
                </Alert>
              )}
              <TextField
                fullWidth
                name="email"
                type="email"
                label="Email Address"
                placeholder="admin@example.com"
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
              <Stack spacing={1.5}>
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
                <Box textAlign="right">
                  <Link
                    variant="body2"
                    fontWeight={600}
                    onClick={() => router.push('/admin/forgot-password')}
                    sx={{ cursor: 'pointer' }}
                  >
                    Forgot password?
                  </Link>
                </Box>
              </Stack>
              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={isSubmitting || isLoading}
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
                {isSubmitting || isLoading ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} color="inherit" />
                    <span>Signing in...</span>
                  </Stack>
                ) : (
                  'Sign In as Admin'
                )}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </Stack>
  );
}

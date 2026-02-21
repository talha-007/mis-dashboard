/**
 * Registration View
 * Two-column layout with image and form. Uses Formik + Yup for validation.
 */

import type { RegisterData } from 'src/types/auth.types';

import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { useState, useEffect, useCallback, memo } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useBankContext } from 'src/utils/bank-context';

import { useAuth } from 'src/hooks';

import { Iconify } from 'src/components/iconify';
import { GoogleLoginButton } from 'src/components/auth';

// ----------------------------------------------------------------------
// Validation schema: email, phone, CNIC, password, confirmPassword
// ----------------------------------------------------------------------

const registerValidationSchema = Yup.object({
  name: Yup.string().required('First name is required').trim(),
  lastname: Yup.string().required('Last name is required').trim(),
  email: Yup.string().required('Email is required').email('Enter a valid email address').trim(),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[+]?[\d\s\-()]{10,20}$/, 'Enter a valid phone number (e.g. +1 555 123 4567)')
    .trim(),
  cnic: Yup.string()
    .required('CNIC is required')
    .matches(/^\d{5}-\d{7}-\d{1}$/, 'CNIC must be in format 12345-6789012-3')
    .trim(),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('password')], 'Passwords do not match'),
});

type RegisterFormValues = RegisterData & { confirmPassword: string };

// Only allow digits, +, space, -, (, ) in phone
const sanitizePhone = (value: string) => value.replace(/[^\d+\s\-()]/g, '');

// Only allow digits and hyphens; auto-format to 12345-6789012-3
const sanitizeCnic = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
};

// ----------------------------------------------------------------------
// Memoized field components so only the field being edited re-renders
// ----------------------------------------------------------------------

type FormFieldProps = {
  name: string;
  value: string | undefined;
  error: string | undefined;
  touched: boolean | undefined;
  onChange: (e: React.ChangeEvent<unknown>) => void;
  onBlur: (e: React.FocusEvent<unknown>) => void;
  helperText?: React.ReactNode;
  disabled?: boolean;
  sx?: object;
  slotProps?: React.ComponentProps<typeof TextField>['slotProps'];
} & Omit<
  React.ComponentProps<typeof TextField>,
  'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'helperText'
>;

const FormField = memo(function FormField({
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
  helperText: helperTextProp,
  disabled,
  sx,
  slotProps: slotPropsProp,
  ...rest
}: FormFieldProps) {
  const showError = Boolean(touched && error);
  const helperText = showError ? error : helperTextProp;
  return (
    <TextField
      fullWidth
      name={name}
      value={value ?? ''}
      onChange={onChange}
      onBlur={onBlur}
      error={showError}
      helperText={helperText}
      disabled={disabled}
      sx={sx}
      slotProps={slotPropsProp}
      {...rest}
    />
  );
});

type FormPasswordFieldProps = FormFieldProps & {
  showPassword: boolean;
  onTogglePassword: () => void;
};

const FormPasswordField = memo(function FormPasswordField({
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
  showPassword,
  onTogglePassword,
  helperText: helperTextProp,
  disabled,
  sx,
  ...rest
}: FormPasswordFieldProps) {
  const showError = Boolean(touched && error);
  const helperText = showError ? error : helperTextProp;
  return (
    <TextField
      fullWidth
      name={name}
      value={value}
      type={showPassword ? 'text' : 'password'}
      onChange={onChange}
      onBlur={onBlur}
      error={showError}
      helperText={helperText}
      disabled={disabled}
      sx={sx}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:lock-outline" width={20} sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={onTogglePassword} edge="end" size="small" aria-label="toggle password">
                <Iconify
                  icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...rest}
    />
  );
});

// Stable slotProps so memoized fields don't re-render when other fields change
const emailSlotProps = {
  input: {
    startAdornment: (
      <InputAdornment position="start">
        <Iconify icon="eva:email-outline" width={20} sx={{ color: 'text.disabled' }} />
      </InputAdornment>
    ),
  },
} as const;

const phoneSlotProps = {
  input: {
    startAdornment: (
      <InputAdornment position="start">
        <Iconify icon="eva:phone-outline" width={20} sx={{ color: 'text.disabled' }} />
      </InputAdornment>
    ),
  },
} as const;

const cnicSlotProps = {
  input: {
    startAdornment: (
      <InputAdornment position="start">
        <Iconify icon="eva:id-card-outline" width={20} sx={{ color: 'text.disabled' }} />
      </InputAdornment>
    ),
  },
} as const;

// ----------------------------------------------------------------------

type RegisterFormFieldsProps = {
  values: RegisterFormValues;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  handleChange: (e: React.ChangeEvent<unknown>) => void;
  handleBlur: (e: React.FocusEvent<unknown>) => void;
  setFieldValue: (field: string, value: unknown) => void;
  error: string | null;
  isLoading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  textFieldSx: object;
};

function RegisterFormFields({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  error,
  isLoading,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
  textFieldSx,
}: RegisterFormFieldsProps) {
  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<unknown>) => {
      const target = (e as React.ChangeEvent<HTMLInputElement>).target;
      setFieldValue('phone', sanitizePhone(target.value));
    },
    [setFieldValue]
  );
  const handleCnicChange = useCallback(
    (e: React.ChangeEvent<unknown>) => {
      const target = (e as React.ChangeEvent<HTMLInputElement>).target;
      setFieldValue('cnic', sanitizeCnic(target.value));
    },
    [setFieldValue]
  );

  return (
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

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormField
            name="name"
            label="First Name"
            placeholder="John"
            value={values.name}
            error={errors.name}
            touched={touched.name}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            sx={textFieldSx}
          />
          <FormField
            name="lastname"
            label="Last Name"
            placeholder="Doe"
            value={values.lastname}
            error={errors.lastname}
            touched={touched.lastname}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            sx={textFieldSx}
          />
        </Stack>

        <FormField
          name="email"
          type="email"
          label="Email Address"
          placeholder="john.doe@example.com"
          value={values.email}
          error={errors.email}
          touched={touched.email}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLoading}
          slotProps={emailSlotProps}
          sx={textFieldSx}
        />

        <FormField
          name="phone"
          label="Phone Number"
          placeholder="+1 (555) 123-4567"
          value={values.phone}
          error={errors.phone}
          touched={touched.phone}
          onChange={handlePhoneChange}
          onBlur={handleBlur}
          disabled={isLoading}
          slotProps={phoneSlotProps}
          sx={textFieldSx}
        />

        <FormField
          name="cnic"
          label="CNIC"
          placeholder="12345-6789012-3"
          value={values.cnic}
          error={errors.cnic}
          touched={touched.cnic}
          onChange={handleCnicChange}
          onBlur={handleBlur}
          disabled={isLoading}
          inputProps={{ maxLength: 15 }}
          slotProps={cnicSlotProps}
          sx={textFieldSx}
        />

        <FormPasswordField
          name="password"
          label="Password"
          placeholder="••••••••"
          value={values.password}
          error={errors.password}
          touched={touched.password}
          onChange={handleChange}
          onBlur={handleBlur}
          showPassword={showPassword}
          onTogglePassword={onTogglePassword}
          helperText="Must be at least 8 characters"
          disabled={isLoading}
          sx={textFieldSx}
        />

        <FormPasswordField
          name="confirmPassword"
          label="Confirm Password"
          placeholder="••••••••"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          touched={touched.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          showPassword={showConfirmPassword}
          onTogglePassword={onToggleConfirmPassword}
          disabled={isLoading}
          sx={textFieldSx}
        />

        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{
            mt: 1,
            py: 1.5,
            borderRadius: 2,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          }}
        >
          {isLoading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} color="inherit" />
              <span>Creating Account...</span>
            </Stack>
          ) : (
            'Create Account'
          )}
        </Button>
      </Stack>
    </Form>
  );
}

// ----------------------------------------------------------------------

export function RegisterView() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const { bankSlug, initializeBankContext } = useBankContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleShowPassword = useCallback(() => setShowPassword((s) => !s), []);
  const toggleShowConfirmPassword = useCallback(() => setShowConfirmPassword((s) => !s), []);

  useEffect(() => {
    if (bankSlug) {
      initializeBankContext();
    }
  }, [bankSlug, initializeBankContext]);

  const initialValues: RegisterFormValues = {
    email: '',
    password: '',
    name: '',
    cnic: '',
    lastname: '',
    phone: '',
    confirmPassword: '',
    bankSlug: bankSlug ?? undefined,
  };

  const handleSubmit = async (values: RegisterFormValues) => {
    const { confirmPassword: _, ...payload } = values;
    const toSend: RegisterData = { ...payload, bankSlug: bankSlug ?? payload.bankSlug };
    try {
      await register(toSend);
      router.push('/verify-otp?type=registration');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleGoogleSuccess = () => {
    router.push('/');
  };

  const textFieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 2 },
  };

  return (
    <Card
      sx={{
        maxWidth: 1200,
        height: '90vh',
        overflow: 'hidden',
        boxShadow: (theme) => theme.customShadows.card,
        borderRadius: 3,
        display: 'flex',
      }}
    >
      <Grid container sx={{ height: '100%', width: '100%' }}>
        {/* Left Column - Image & Text */}
        <Grid
          size={{ xs: 12, md: 5 }}
          sx={{
            position: 'relative',
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6,
            color: 'white',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <Stack spacing={4} sx={{ zIndex: 1, maxWidth: 400 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.common.white, 0.2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Iconify icon="solar:shield-check-bold" width={40} />
            </Box>
            <Stack spacing={2}>
              <Typography variant="h3" fontWeight={700}>
                Start Your Financial Journey
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
                Join thousands of satisfied customers who trust us with their financial needs.
              </Typography>
            </Stack>
            <Stack spacing={2.5}>
              {[
                {
                  icon: 'solar:verified-check-bold',
                  title: 'Secure & Trusted',
                  desc: 'Bank-level security for your data',
                },
                {
                  icon: 'solar:wallet-money-bold',
                  title: 'Easy Management',
                  desc: 'Manage your finances with ease',
                },
                {
                  icon: 'solar:graph-up-bold',
                  title: 'Grow Your Wealth',
                  desc: 'Access to best financial products',
                },
              ].map((feature, index) => (
                <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: (theme) => alpha(theme.palette.common.white, 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={feature.icon} width={20} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {feature.desc}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Grid>

        {/* Right Column - Form */}
        <Grid
          size={{ xs: 12, md: 7 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'auto',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: (theme) => theme.palette.divider,
              borderRadius: '10px',
              '&:hover': { backgroundColor: (theme) => theme.palette.action.hover },
            },
            scrollbarWidth: 'thin',
          }}
        >
          <Box sx={{ p: { xs: 3, sm: 5, md: 6 }, flex: 1 }}>
            <Stack spacing={4}>
              <Stack spacing={1.5}>
                <Typography variant="h4" fontWeight={700}>
                  Create Your Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join us today and start managing your finances
                </Typography>
              </Stack>

              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                disabled={isLoading}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              />

              <Divider sx={{ '&::before, &::after': { borderTopStyle: 'dashed' } }}>
                <Typography variant="body2" sx={{ color: 'text.disabled', px: 2 }}>
                  or continue with email
                </Typography>
              </Divider>

              <Formik
                initialValues={initialValues}
                validationSchema={registerValidationSchema}
                onSubmit={handleSubmit}
                validateOnChange={false}
                validateOnBlur
              >
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                  <RegisterFormFields
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    setFieldValue={setFieldValue}
                    error={error}
                    isLoading={isLoading}
                    showPassword={showPassword}
                    showConfirmPassword={showConfirmPassword}
                    onTogglePassword={toggleShowPassword}
                    onToggleConfirmPassword={toggleShowConfirmPassword}
                    textFieldSx={textFieldSx}
                  />
                )}
              </Formik>

              <Stack spacing={2}>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  By creating an account, you agree to our{' '}
                  <Link
                    variant="caption"
                    color="primary"
                    underline="hover"
                    sx={{ cursor: 'pointer', fontWeight: 500 }}
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    variant="caption"
                    color="primary"
                    underline="hover"
                    sx={{ cursor: 'pointer', fontWeight: 500 }}
                  >
                    Privacy Policy
                  </Link>
                </Typography>
                <Divider />
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary" display="inline">
                    Already have an account?{' '}
                  </Typography>
                  <Link
                    variant="body2"
                    fontWeight={600}
                    onClick={() => router.push('/sign-in')}
                    sx={{ cursor: 'pointer' }}
                  >
                    Sign In
                  </Link>
                </Box>
              </Stack>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}

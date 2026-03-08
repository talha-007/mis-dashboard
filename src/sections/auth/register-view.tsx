/**
 * Registration View
 * Matches sign-in layout: left brand panel + right form. Uses Formik + Yup for validation.
 */

import type { RegisterData } from 'src/types/auth.types';

import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { memo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useBankContext } from 'src/utils/bank-context';

import { useAuth } from 'src/hooks';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { GoogleLoginButton } from 'src/components/auth';

// ----------------------------------------------------------------------
// Same feature list as sign-in for consistent brand panel
// ----------------------------------------------------------------------

const FEATURES = [
  {
    icon: 'solar:chart-2-bold-duotone',
    title: 'Portfolio Analytics',
    desc: 'Real-time KPIs, PAR tracking and disbursement trends',
  },
  {
    icon: 'solar:users-group-rounded-bold-duotone',
    title: 'Borrower Management',
    desc: 'Full borrower lifecycle — KYC, scoring, and repayments',
  },
  {
    icon: 'solar:shield-check-bold-duotone',
    title: 'Credit Risk Engine',
    desc: 'Automated grading, eligibility checks and risk reports',
  },
  {
    icon: 'solar:graph-up-bold-duotone',
    title: 'Recovery Tracking',
    desc: 'Overdue management, officer assignment and case notes',
  },
];

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
                onClick={onTogglePassword}
                edge="end"
                size="small"
                aria-label="toggle password"
              >
                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={20} />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...rest}
    />
  );
});

// Stable slotProps so memoized fields don't re-render when other fields change (match sign-in icons)
const emailSlotProps = {
  input: {
    startAdornment: (
      <InputAdornment position="start">
        <Iconify icon="solar:inbox-bold-duotone" width={20} sx={{ color: 'text.disabled' }} />
      </InputAdornment>
    ),
  },
} as const;

const phoneSlotProps = {
  input: {
    startAdornment: (
      <InputAdornment position="start">
        <Iconify icon="solar:phone-bold-duotone" width={20} sx={{ color: 'text.disabled' }} />
      </InputAdornment>
    ),
  },
} as const;

const cnicSlotProps = {
  input: {
    startAdornment: (
      <InputAdornment position="start">
        <Iconify icon="solar:id-verified-bold-duotone" width={20} sx={{ color: 'text.disabled' }} />
      </InputAdornment>
    ),
  },
} as const;

const nameSlotProps = {
  input: {
    startAdornment: (
      <InputAdornment position="start">
        <Iconify icon="solar:user-bold-duotone" width={20} sx={{ color: 'text.disabled' }} />
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
      <Stack spacing={2.5}>
        {error && (
          <Alert severity="error" sx={{ mb: 0, borderRadius: 2 }}>
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
            slotProps={nameSlotProps}
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
            slotProps={nameSlotProps}
            sx={textFieldSx}
          />
        </Stack>

        <FormField
          name="email"
          type="email"
          label="Email address"
          placeholder="you@company.com"
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
            fontSize: '0.95rem',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: (theme) =>
              `0 8px 24px ${alpha(theme.palette.primary.main, 0.32)}`,
            '&:hover': {
              boxShadow: (theme) =>
                `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          {isLoading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} color="inherit" />
              <span>Creating account…</span>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <span>Create account</span>
              <Iconify icon="solar:arrow-right-bold" width={18} />
            </Stack>
          )}
        </Button>
      </Stack>
    </Form>
  );
}

// ----------------------------------------------------------------------

export function RegisterView() {
  const theme = useTheme();
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
        display: 'flex',
        overflow: 'hidden',
        width: '100%',
        maxWidth: 980,
        maxHeight: { xs: 'calc(100vh - 48px)', md: 'calc(100vh - 80px)' },
        minHeight: { xs: 0, md: 500 },
        borderRadius: 3,
        boxShadow: theme.customShadows?.z24 || '0 24px 48px rgba(0,0,0,0.18)',
      }}
    >
      {/* ── Left: Brand panel (matches sign-in) ───────────────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '44%',
          flexShrink: 0,
          p: 5,
          background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, ${alpha(theme.palette.primary.light, 0.9)} 100%)`,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -80,
            right: -80,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: alpha('#fff', 0.06),
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: alpha('#fff', 0.05),
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Logo
            sx={{
              filter: 'brightness(0) invert(1)',
              height: 36,
              '& img': { height: 36 },
            }}
          />
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1, my: 'auto', py: 4 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            lineHeight={1.2}
            sx={{ mb: 1.5, letterSpacing: '-0.5px' }}
          >
            Manage your
            <br />
            portfolio smarter.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.75, mb: 4, maxWidth: 280 }}>
            Complete MIS platform built for modern microfinance institutions.
          </Typography>

          <Stack spacing={2.5}>
            {FEATURES.map((f) => (
              <Stack key={f.title} direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha('#fff', 0.15),
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  <Iconify icon={f.icon} width={18} sx={{ color: '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff' }}>
                    {f.title}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.65, color: '#fff' }}>
                    {f.desc}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ opacity: 0.4, position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} MIS Dashboard. All rights reserved.
        </Typography>
      </Box>

      {/* ── Right: Form panel (scrollable when form is long) ───────────────── */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          px: { xs: 3, sm: 5, md: 6 },
          py: { xs: 4, sm: 5, md: 5 },
          bgcolor: 'background.paper',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 3,
            bgcolor: 'action.hover',
          },
        }}
      >
        <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 4 }}>
          <Logo sx={{ height: 32, '& img': { height: 32 } }} />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.75, letterSpacing: '-0.3px' }}>
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join us today and start managing your finances
          </Typography>
        </Box>

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

        <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
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

        <Stack spacing={2} sx={{ mt: 4 }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
            <Link
              variant="body2"
              fontWeight={600}
              onClick={() => router.push('/sign-in')}
              sx={{ cursor: 'pointer', color: 'primary.main' }}
            >
              Sign in
            </Link>
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}

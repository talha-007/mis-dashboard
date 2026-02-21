import * as Yup from 'yup';
import { useFormik } from 'formik';
import { memo, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import bankService from 'src/redux/services/bank.services';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type BankFormValues = {
  name: string;
  code: string;
  registrationNumber: string;
  taxId: string;
  licenseNumber: string;
  bankType: string;
  establishedDate: string;
  capitalAmount: string;
  email: string;
  phone: string;
  website: string;
  fax: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  adminEmail: string;
  password: string;
  confirmPassword: string;
  status: 'active';
};

const defaultValues: BankFormValues = {
  name: '',
  code: '',
  registrationNumber: '',
  taxId: '',
  licenseNumber: '',
  bankType: '',
  establishedDate: '',
  capitalAmount: '',
  email: '',
  phone: '',
  website: '',
  fax: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  adminEmail: '',
  password: '',
  confirmPassword: '',
  status: 'active',
};

function getBankFormSchema(isEditMode: boolean) {
  return Yup.object({
    name: Yup.string().required('Bank name is required').trim(),
    code: Yup.string().required('Bank code is required').trim(),
    registrationNumber: Yup.string().trim(),
    taxId: Yup.string().trim(),
    licenseNumber: Yup.string().trim(),
    bankType: Yup.string().trim(),
    establishedDate: Yup.string().trim(),
    capitalAmount: Yup.string().trim(),
    email: Yup.string().required('Email is required').email('Enter a valid email address').trim(),
    phone: Yup.string().required('Phone is required').trim(),
    website: Yup.string()
      .trim()
      .test('url', 'Enter a valid URL', (v) => !v || /^https?:\/\/.+/.test(v)),
    fax: Yup.string().trim(),
    address: Yup.string().required('Address is required').trim(),
    city: Yup.string().trim(),
    state: Yup.string().trim(),
    zipCode: Yup.string().trim(),
    country: Yup.string().trim(),
    adminEmail: isEditMode
      ? Yup.string().trim()
      : Yup.string()
          .required('Admin email is required')
          .email('Enter a valid email address')
          .trim(),
    password: isEditMode
      ? Yup.string().trim()
      : Yup.string()
          .required('Password is required')
          .min(8, 'Password must be at least 8 characters'),
    confirmPassword: isEditMode
      ? Yup.string().trim()
      : Yup.string()
          .required('Confirm password is required')
          .oneOf([Yup.ref('password')], 'Passwords do not match'),
  });
}

// ----------------------------------------------------------------------
// Memoized field components so only the field being edited re-renders on keystroke
// ----------------------------------------------------------------------

type FormFieldProps = {
  name: string;
  value: string;
  error: string | undefined;
  touched: boolean | undefined;
  onChange: (e: React.ChangeEvent<unknown>) => void;
  onBlur: (e: React.FocusEvent<unknown>) => void;
  helperText?: React.ReactNode;
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
  ...rest
}: FormFieldProps) {
  const showError = Boolean(touched && error);
  const helperText = showError ? error : helperTextProp;
  return (
    <TextField
      fullWidth
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={showError}
      helperText={helperText}
      {...rest}
    />
  );
});

const BANK_TYPE_OPTIONS = [
  { value: '', label: 'Select Type' },
  { value: 'commercial', label: 'Commercial Bank' },
  { value: 'microfinance', label: 'Microfinance Bank' },
  { value: 'islamic', label: 'Islamic Bank' },
  { value: 'development', label: 'Development Bank' },
  { value: 'savings', label: 'Savings Bank' },
] as const;

const FormSelectField = memo(function FormSelectField({
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
  ...rest
}: FormFieldProps) {
  const showError = Boolean(touched && error);
  return (
    <TextField
      fullWidth
      select
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={showError}
      helperText={showError ? error : undefined}
      {...rest}
    >
      {BANK_TYPE_OPTIONS.map((opt) => (
        <MenuItem key={opt.value || 'empty'} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
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
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={onTogglePassword} edge="end" aria-label="toggle password">
              <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...rest}
    />
  );
});

// ----------------------------------------------------------------------

type BankFormViewProps = {
  bankId?: string;
};

export function BankFormView({ bankId }: BankFormViewProps) {
  const router = useRouter();
  const isEditMode = !!bankId;

  const [fetching, setFetching] = useState(isEditMode);
  const [initialValues, setInitialValues] = useState<BankFormValues>(defaultValues);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleShowPassword = useCallback(() => setShowPassword((s) => !s), []);
  const toggleShowConfirmPassword = useCallback(() => setShowConfirmPassword((s) => !s), []);

  const validationSchema = useMemo(() => getBankFormSchema(isEditMode), [isEditMode]);

  const formik = useFormik<BankFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const bankPayload: Record<string, unknown> = {
          name: values.name,
          code: values.code,
          email: values.email,
          phone: values.phone,
          address: values.address,
          status: values.status,
          capitalAmount: values.capitalAmount || undefined,
        };
        if (values.registrationNumber) bankPayload.registrationNumber = values.registrationNumber;
        if (values.taxId) bankPayload.taxId = values.taxId;
        if (values.licenseNumber) bankPayload.licenseNumber = values.licenseNumber;
        if (values.bankType) bankPayload.bankType = values.bankType;
        if (values.establishedDate) bankPayload.establishedDate = values.establishedDate;
        if (values.website) bankPayload.website = values.website;
        if (values.fax) bankPayload.fax = values.fax;
        if (values.city) bankPayload.city = values.city;
        if (values.state) bankPayload.state = values.state;
        if (values.zipCode) bankPayload.zipCode = values.zipCode;
        if (values.country) bankPayload.country = values.country;
        if (!isEditMode) {
          bankPayload.adminEmail = values.adminEmail;
          bankPayload.password = values.password;
        }

        if (isEditMode && bankId) {
          await bankService.updateBank(bankId, bankPayload);
        } else {
          await bankService.addBank(bankPayload);
        }
        router.push('/bank-management');
      } catch (err: unknown) {
        const errorMsg =
          (
            err as {
              response?: { data?: { message?: string }; message?: string };
              message?: string;
            }
          )?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Failed to save bank';
        formik.setStatus({ submitError: errorMsg });
      }
    },
  });

  // Fetch bank data if editing
  useEffect(() => {
    const fetchBank = async () => {
      if (!bankId) return;
      try {
        setFetching(true);
        setFetchError(null);
        const response = await bankService.getBankById(bankId);
        const bank = response.data?.bank;
        if (bank) {
          setInitialValues({
            name: bank.name || '',
            code: bank.code || '',
            registrationNumber: bank.registrationNumber || '',
            taxId: bank.taxId || '',
            licenseNumber: bank.licenseNumber || '',
            bankType: bank.bankType || '',
            establishedDate: bank.establishedDate || '',
            capitalAmount: bank.capitalAmount ?? '',
            email: bank.email || '',
            phone: bank.phone || '',
            website: bank.website || '',
            fax: bank.fax || '',
            address: bank.address || '',
            city: bank.city || '',
            state: bank.state || '',
            zipCode: bank.zipCode || '',
            country: bank.country || '',
            adminEmail: bank.adminEmail || '',
            password: '',
            confirmPassword: '',
            status: (bank.status as 'active') || 'active',
          });
        }
      } catch {
        setFetchError('Failed to fetch bank data');
      } finally {
        setFetching(false);
      }
    };
    fetchBank();
  }, [bankId]);

  const { values, touched, errors, handleChange, handleBlur, status, setStatus } = formik;

  if (fetching) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
              <Iconify icon="eva:arrow-back-fill" />
            </IconButton>
            <Typography variant="h4">{isEditMode ? 'Edit Bank' : 'Register New Bank'}</Typography>
          </Box>
        </Box>

        {/* Errors */}
        {(status?.submitError || fetchError) && (
          <Alert
            severity="error"
            onClose={() => {
              setStatus(undefined);
              setFetchError(null);
            }}
          >
            {status?.submitError || fetchError}
          </Alert>
        )}

        {/* Form Card */}
        <Card sx={{ p: 3 }}>
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={4}>
              {/* Basic Information Section */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, pb: 1, borderBottom: 1, borderColor: 'divider' }}
                >
                  Basic Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      required
                      label="Bank Name"
                      name="name"
                      value={values.name}
                      error={errors.name}
                      touched={touched.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="National Microfinance Bank"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      required
                      label="Bank Code"
                      name="code"
                      value={values.code}
                      error={errors.code}
                      touched={touched.code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText="Unique identifier for the bank"
                      placeholder="NMB001"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      label="Registration Number"
                      name="registrationNumber"
                      value={values.registrationNumber}
                      error={errors.registrationNumber}
                      touched={touched.registrationNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="REG-2024-001"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      label="Tax ID / NTN"
                      name="taxId"
                      value={values.taxId}
                      error={errors.taxId}
                      touched={touched.taxId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="1234567-8"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      label="License Number"
                      name="licenseNumber"
                      value={values.licenseNumber}
                      error={errors.licenseNumber}
                      touched={touched.licenseNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="LIC-2024-001"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormSelectField
                      label="Bank Type"
                      name="bankType"
                      value={values.bankType}
                      error={errors.bankType}
                      touched={touched.bankType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      label="Capital Amount"
                      name="capitalAmount"
                      value={values.capitalAmount}
                      error={errors.capitalAmount}
                      touched={touched.capitalAmount}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      The amount of money the bank has in its reserves.
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      type="date"
                      label="Established Date"
                      name="establishedDate"
                      value={values.establishedDate}
                      error={errors.establishedDate}
                      touched={touched.establishedDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Contact Information Section */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, pb: 1, borderBottom: 1, borderColor: 'divider' }}
                >
                  Contact Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      required
                      type="email"
                      label="Email Address"
                      name="email"
                      value={values.email}
                      error={errors.email}
                      touched={touched.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="info@bank.com"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      required
                      label="Phone Number"
                      name="phone"
                      value={values.phone}
                      error={errors.phone}
                      touched={touched.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="+92 300 1234567"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      type="url"
                      label="Website"
                      name="website"
                      value={values.website}
                      error={errors.website}
                      touched={touched.website}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="https://www.bank.com"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      label="Fax Number"
                      name="fax"
                      value={values.fax}
                      error={errors.fax}
                      touched={touched.fax}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="+92 21 1234567"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Address Information Section */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, pb: 1, borderBottom: 1, borderColor: 'divider' }}
                >
                  Address Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <FormField
                      required
                      label="Street Address"
                      name="address"
                      value={values.address}
                      error={errors.address}
                      touched={touched.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      multiline
                      rows={2}
                      placeholder="123 Main Street"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormField
                      label="City"
                      name="city"
                      value={values.city}
                      error={errors.city}
                      touched={touched.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Karachi"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormField
                      label="State / Province"
                      name="state"
                      value={values.state}
                      error={errors.state}
                      touched={touched.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Sindh"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormField
                      label="Zip / Postal Code"
                      name="zipCode"
                      value={values.zipCode}
                      error={errors.zipCode}
                      touched={touched.zipCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="75000"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormField
                      label="Country"
                      name="country"
                      value={values.country}
                      error={errors.country}
                      touched={touched.country}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Pakistan"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Admin Credentials Section (only for new banks) */}
              {!isEditMode && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, pb: 1, borderBottom: 1, borderColor: 'divider' }}
                  >
                    Admin Credentials
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Create login credentials for the bank administrator
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormField
                        required
                        type="email"
                        label="Admin Email"
                        name="adminEmail"
                        value={values.adminEmail}
                        error={errors.adminEmail}
                        touched={touched.adminEmail}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        helperText="This will be used for bank admin login"
                        placeholder="admin@bank.com"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormPasswordField
                        required
                        label="Password"
                        name="password"
                        value={values.password}
                        error={errors.password}
                        touched={touched.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        showPassword={showPassword}
                        onTogglePassword={toggleShowPassword}
                        helperText="Minimum 8 characters"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormPasswordField
                        required
                        label="Confirm Password"
                        name="confirmPassword"
                        value={values.confirmPassword}
                        error={errors.confirmPassword}
                        touched={touched.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        showPassword={showConfirmPassword}
                        onTogglePassword={toggleShowConfirmPassword}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Action Buttons */}
              <Box display="flex" gap={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  disabled={formik.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={formik.isSubmitting}
                  startIcon={
                    formik.isSubmitting ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Iconify icon="eva:save-fill" />
                    )
                  }
                >
                  {formik.isSubmitting ? 'Saving...' : isEditMode ? 'Update Bank' : 'Register Bank'}
                </Button>
              </Box>
            </Stack>
          </form>
        </Card>
      </Stack>
    </DashboardContent>
  );
}

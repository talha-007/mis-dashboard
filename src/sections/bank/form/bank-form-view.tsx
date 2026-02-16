import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useState, useEffect } from 'react';

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

  const validationSchema = useMemo(() => getBankFormSchema(isEditMode), [isEditMode]);

  const formik = useFormik<BankFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema,
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
                    <TextField
                      fullWidth
                      required
                      label="Bank Name"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
                      placeholder="National Microfinance Bank"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Bank Code"
                      name="code"
                      value={values.code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.code && errors.code)}
                      helperText={(touched.code && errors.code) || 'Unique identifier for the bank'}
                      placeholder="NMB001"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Registration Number"
                      name="registrationNumber"
                      value={values.registrationNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                      helperText={touched.registrationNumber && errors.registrationNumber}
                      placeholder="REG-2024-001"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Tax ID / NTN"
                      name="taxId"
                      value={values.taxId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.taxId && errors.taxId)}
                      helperText={touched.taxId && errors.taxId}
                      placeholder="1234567-8"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="License Number"
                      name="licenseNumber"
                      value={values.licenseNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.licenseNumber && errors.licenseNumber)}
                      helperText={touched.licenseNumber && errors.licenseNumber}
                      placeholder="LIC-2024-001"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      select
                      label="Bank Type"
                      name="bankType"
                      value={values.bankType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.bankType && errors.bankType)}
                      helperText={touched.bankType && errors.bankType}
                    >
                      <MenuItem value="">Select Type</MenuItem>
                      <MenuItem value="commercial">Commercial Bank</MenuItem>
                      <MenuItem value="microfinance">Microfinance Bank</MenuItem>
                      <MenuItem value="islamic">Islamic Bank</MenuItem>
                      <MenuItem value="development">Development Bank</MenuItem>
                      <MenuItem value="savings">Savings Bank</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Capital Amount"
                      name="capitalAmount"
                      value={values.capitalAmount}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.capitalAmount && errors.capitalAmount)}
                      helperText={touched.capitalAmount && errors.capitalAmount}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      The amount of money the bank has in its reserves.
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Established Date"
                      name="establishedDate"
                      value={values.establishedDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.establishedDate && errors.establishedDate)}
                      helperText={touched.establishedDate && errors.establishedDate}
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
                    <TextField
                      fullWidth
                      required
                      type="email"
                      label="Email Address"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.email && errors.email)}
                      helperText={touched.email && errors.email}
                      placeholder="info@bank.com"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Phone Number"
                      name="phone"
                      value={values.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.phone && errors.phone)}
                      helperText={touched.phone && errors.phone}
                      placeholder="+92 300 1234567"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="url"
                      label="Website"
                      name="website"
                      value={values.website}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.website && errors.website)}
                      helperText={touched.website && errors.website}
                      placeholder="https://www.bank.com"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Fax Number"
                      name="fax"
                      value={values.fax}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.fax && errors.fax)}
                      helperText={touched.fax && errors.fax}
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
                    <TextField
                      fullWidth
                      required
                      label="Street Address"
                      name="address"
                      value={values.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.address && errors.address)}
                      helperText={touched.address && errors.address}
                      multiline
                      rows={2}
                      placeholder="123 Main Street"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={values.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.city && errors.city)}
                      helperText={touched.city && errors.city}
                      placeholder="Karachi"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="State / Province"
                      name="state"
                      value={values.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.state && errors.state)}
                      helperText={touched.state && errors.state}
                      placeholder="Sindh"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Zip / Postal Code"
                      name="zipCode"
                      value={values.zipCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.zipCode && errors.zipCode)}
                      helperText={touched.zipCode && errors.zipCode}
                      placeholder="75000"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      value={values.country}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.country && errors.country)}
                      helperText={touched.country && errors.country}
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
                      <TextField
                        fullWidth
                        required
                        type="email"
                        label="Admin Email"
                        name="adminEmail"
                        value={values.adminEmail}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.adminEmail && errors.adminEmail)}
                        helperText={
                          (touched.adminEmail && errors.adminEmail) ||
                          'This will be used for bank admin login'
                        }
                        placeholder="admin@bank.com"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.password && errors.password)}
                        helperText={(touched.password && errors.password) || 'Minimum 8 characters'}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                <Iconify
                                  icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required
                        type={showConfirmPassword ? 'text' : 'password'}
                        label="Confirm Password"
                        name="confirmPassword"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                <Iconify
                                  icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
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

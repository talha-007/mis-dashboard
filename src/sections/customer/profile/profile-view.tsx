import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { DashboardContent } from 'src/layouts/dashboard';
import { FormField } from 'src/components/form';

const sanitizePhone = (value: string) => value.replace(/[^\d+\s\-()]/g, '');
const sanitizeCnic = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
};

const profileSchema = Yup.object({
  firstName: Yup.string().required('First name is required').trim(),
  lastName: Yup.string().required('Last name is required').trim(),
  email: Yup.string().required('Email is required').email('Enter a valid email address').trim(),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[+]?[\d\s\-()]{10,20}$/, 'Enter a valid phone number')
    .trim(),
  cnic: Yup.string()
    .required('CNIC is required')
    .matches(/^\d{5}-\d{7}-\d{1}$/, 'CNIC must be in format 12345-6789012-3')
    .trim(),
  address: Yup.string().required('Address is required').trim(),
  monthlyIncome: Yup.string().required('Monthly income is required').trim(),
  monthlyExpense: Yup.string().required('Monthly expense is required').trim(),
});

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cnic: string;
  address: string;
  monthlyIncome: string;
  monthlyExpense: string;
};

const initialValues: ProfileFormValues = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'customer@mis.local',
  phone: '+92 300 1234567',
  cnic: '12345-6789012-3',
  address: 'Lahore, Punjab',
  monthlyIncome: '50000',
  monthlyExpense: '30000',
};

const pkrSlotProps = {
  input: {
    startAdornment: (
      <InputAdornment position="start">
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          PKR
        </Typography>
      </InputAdornment>
    ),
  },
} as const;

type ProfileFormFieldsProps = {
  values: ProfileFormValues;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  handleChange: (e: React.ChangeEvent<unknown>) => void;
  handleBlur: (e: React.FocusEvent<unknown>) => void;
  setFieldValue: (field: string, value: unknown) => void;
};

function ProfileFormFields({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}: ProfileFormFieldsProps) {
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
        <Card>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  label="First Name"
                  name="firstName"
                  value={values.firstName}
                  error={errors.firstName}
                  touched={touched.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  label="Last Name"
                  name="lastName"
                  value={values.lastName}
                  error={errors.lastName}
                  touched={touched.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  error={errors.email}
                  touched={touched.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  label="Phone"
                  name="phone"
                  value={values.phone}
                  error={errors.phone}
                  touched={touched.phone}
                  onChange={handlePhoneChange}
                  onBlur={handleBlur}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  label="CNIC"
                  name="cnic"
                  value={values.cnic}
                  error={errors.cnic}
                  touched={touched.cnic}
                  onChange={handleCnicChange}
                  onBlur={handleBlur}
                  inputProps={{ maxLength: 15 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  label="Address"
                  name="address"
                  value={values.address}
                  error={errors.address}
                  touched={touched.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Grid>
            </Grid>
          </Box>
        </Card>

        <Card>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Financial Information
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  label="Monthly Income"
                  name="monthlyIncome"
                  type="number"
                  value={values.monthlyIncome}
                  error={errors.monthlyIncome}
                  touched={touched.monthlyIncome}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  slotProps={pkrSlotProps}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  label="Monthly Expense"
                  name="monthlyExpense"
                  type="number"
                  value={values.monthlyExpense}
                  error={errors.monthlyExpense}
                  touched={touched.monthlyExpense}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  slotProps={pkrSlotProps}
                />
              </Grid>
            </Grid>
          </Box>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button type="button" variant="outlined" size="large">
            Cancel
          </Button>
          <Button type="submit" variant="contained" size="large">
            Update Profile
          </Button>
        </Box>
      </Stack>
    </Form>
  );
}

export function ProfileView() {
  const handleSubmit = (values: ProfileFormValues) => {
    console.log('Profile updated:', values);
    // TODO: call API (e.g. authService.updateProfile)
  };

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Typography variant="h4">Update Profile</Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={profileSchema}
            onSubmit={handleSubmit}
            validateOnChange={false}
            validateOnBlur
          >
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
              <ProfileFormFields
                values={values}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
                setFieldValue={setFieldValue}
              />
            )}
          </Formik>
        </Stack>
      </Container>
    </DashboardContent>
  );
}

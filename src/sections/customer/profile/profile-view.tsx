import * as Yup from 'yup';
import { Form, Formik } from 'formik';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { DashboardContent } from 'src/layouts/dashboard';

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
          >
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
              <Form>
                <Stack spacing={3}>
                  <Card>
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ mb: 3 }}>
                        Personal Information
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="First Name"
                            name="firstName"
                            value={values.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={Boolean(touched.firstName && errors.firstName)}
                            helperText={touched.firstName && errors.firstName}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Last Name"
                            name="lastName"
                            value={values.lastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={Boolean(touched.lastName && errors.lastName)}
                            helperText={touched.lastName && errors.lastName}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={Boolean(touched.email && errors.email)}
                            helperText={touched.email && errors.email}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Phone"
                            name="phone"
                            value={values.phone}
                            onChange={(e) => setFieldValue('phone', sanitizePhone(e.target.value))}
                            onBlur={handleBlur}
                            error={Boolean(touched.phone && errors.phone)}
                            helperText={touched.phone && errors.phone}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="CNIC"
                            name="cnic"
                            value={values.cnic}
                            onChange={(e) => setFieldValue('cnic', sanitizeCnic(e.target.value))}
                            onBlur={handleBlur}
                            error={Boolean(touched.cnic && errors.cnic)}
                            helperText={touched.cnic && errors.cnic}
                            inputProps={{ maxLength: 15 }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Address"
                            name="address"
                            value={values.address}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={Boolean(touched.address && errors.address)}
                            helperText={touched.address && errors.address}
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
                          <TextField
                            fullWidth
                            label="Monthly Income"
                            name="monthlyIncome"
                            type="number"
                            value={values.monthlyIncome}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={Boolean(touched.monthlyIncome && errors.monthlyIncome)}
                            helperText={touched.monthlyIncome && errors.monthlyIncome}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                      PKR
                                    </Typography>
                                  </InputAdornment>
                                ),
                              },
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Monthly Expense"
                            name="monthlyExpense"
                            type="number"
                            value={values.monthlyExpense}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={Boolean(touched.monthlyExpense && errors.monthlyExpense)}
                            helperText={touched.monthlyExpense && errors.monthlyExpense}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                      PKR
                                    </Typography>
                                  </InputAdornment>
                                ),
                              },
                            }}
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
            )}
          </Formik>
        </Stack>
      </Container>
    </DashboardContent>
  );
}

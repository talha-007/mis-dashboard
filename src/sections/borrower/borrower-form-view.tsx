import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { DashboardContent } from 'src/layouts/dashboard';
import borrowerService from 'src/redux/services/borrowServices';

import { Iconify } from 'src/components/iconify';

const BORROWER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

const BORROWER_RATING_OPTIONS = [
  { value: 'A', label: 'A - Excellent' },
  { value: 'B', label: 'B - Good' },
  { value: 'C', label: 'C - Fair' },
  { value: 'D', label: 'D - Poor' },
];

const borrowerSchema = Yup.object({
  name: Yup.string().required('Borrower name is required').trim(),
  email: Yup.string().required('Email is required').email('Enter a valid email address').trim(),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[+]?[\d\s\-()]{10,20}$/, 'Enter a valid phone number')
    .trim(),
  loanAmount: Yup.number()
    .required('Loan amount is required')
    .min(0.01, 'Loan amount must be greater than 0'),
  status: Yup.string().required().oneOf(BORROWER_STATUS_OPTIONS.map((o) => o.value)),
  rating: Yup.string().required().oneOf(BORROWER_RATING_OPTIONS.map((o) => o.value)),
  address: Yup.string().required('Address is required').trim(),
});

export interface BorrowerFormData {
  name: string;
  email: string;
  phone: string;
  loanAmount: number;
  status: string;
  rating: string;
  address: string;
}

interface BorrowerFormViewProps {
  isEdit?: boolean;
  initialData?: BorrowerFormData;
}

const initialValues: BorrowerFormData = {
  name: '',
  email: '',
  phone: '',
  loanAmount: 0,
  status: 'active',
  rating: 'C',
  address: '',
};

export function BorrowerFormView({ isEdit = false, initialData }: BorrowerFormViewProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleSubmit = async (values: BorrowerFormData, { setStatus }: { setStatus: (s: any) => void }) => {
    try {
      if (isEdit && id) {
        await borrowerService.update(id, values);
        toast.success('Borrower updated successfully!');
      } else {
        await borrowerService.create(values);
        toast.success('Borrower created successfully!');
      }
      navigate('/borrower-management');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'An error occurred';
      setStatus({ submitError: errorMessage });
      toast.error(errorMessage);
      throw err;
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<Iconify icon="eva:arrow-ios-back-fill" />} onClick={() => navigate('/borrower-management')} color="inherit" variant="text">
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {isEdit ? 'Edit Borrower' : 'Add Borrower'}
        </Typography>
      </Box>

      <Card sx={{ p: 3 }}>
        <Formik
          initialValues={initialData || initialValues}
          validationSchema={borrowerSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setStatus, isSubmitting, status }) => (
            <Form>
              <Stack spacing={3}>
                {status?.submitError && (
                  <Alert severity="error" sx={{ mb: 3 }} onClose={() => setStatus(undefined)}>
                    {status.submitError}
                  </Alert>
                )}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Borrower Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                    placeholder="Enter borrower name"
                  />
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
                    placeholder="Enter email address"
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.phone && errors.phone)}
                    helperText={touched.phone && errors.phone}
                    placeholder="Enter phone number"
                  />
                  <TextField
                    fullWidth
                    label="Loan Amount"
                    name="loanAmount"
                    type="number"
                    value={values.loanAmount || ''}
                    onChange={(e) => setFieldValue('loanAmount', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    onBlur={handleBlur}
                    error={Boolean(touched.loanAmount && errors.loanAmount)}
                    helperText={touched.loanAmount && errors.loanAmount}
                    placeholder="0.00"
                    inputProps={{ step: '0.01', min: '0' }}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.status && errors.status)}
                    helperText={touched.status && errors.status}
                  >
                    {BORROWER_STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    select
                    label="Rating"
                    name="rating"
                    value={values.rating}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.rating && errors.rating)}
                    helperText={touched.rating && errors.rating}
                  >
                    {BORROWER_RATING_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.address && errors.address)}
                  helperText={touched.address && errors.address}
                  placeholder="Enter full address"
                  multiline
                  rows={3}
                />
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 2 }}>
                  <Button variant="outlined" color="inherit" onClick={() => navigate('/borrower-management')} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    loading={isSubmitting}
                    type="submit"
                    startIcon={<Iconify icon="eva:save-fill" />}
                  >
                    {isEdit ? 'Update Borrower' : 'Add Borrower'}
                  </LoadingButton>
                </Stack>
              </Stack>
            </Form>
          )}
        </Formik>
      </Card>
    </DashboardContent>
  );
}

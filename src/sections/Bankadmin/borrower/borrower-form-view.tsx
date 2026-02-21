import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { DashboardContent } from 'src/layouts/dashboard';
import borrowerService from 'src/redux/services/borrowServices';

import { Iconify } from 'src/components/iconify';
import { FormField, FormSelectField } from 'src/components/form';

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
  status: Yup.string()
    .required()
    .oneOf(BORROWER_STATUS_OPTIONS.map((o) => o.value)),
  rating: Yup.string()
    .required()
    .oneOf(BORROWER_RATING_OPTIONS.map((o) => o.value)),
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

type BorrowerFormFieldsProps = {
  values: BorrowerFormData;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  handleChange: (e: React.ChangeEvent<unknown>) => void;
  handleBlur: (e: React.FocusEvent<unknown>) => void;
  setFieldValue: (field: string, value: unknown) => void;
  setStatus: (s: { submitError?: string } | undefined) => void;
  isSubmitting: boolean;
  status?: { submitError?: string };
  onCancel: () => void;
  isEdit: boolean;
};

function BorrowerFormFields({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  setStatus,
  isSubmitting,
  status,
  onCancel,
  isEdit,
}: BorrowerFormFieldsProps) {
  const handleLoanAmountChange = useCallback(
    (e: React.ChangeEvent<unknown>) => {
      const target = (e as React.ChangeEvent<HTMLInputElement>).target;
      setFieldValue(
        'loanAmount',
        target.value === '' ? 0 : parseFloat(target.value) || 0
      );
    },
    [setFieldValue]
  );
  return (
    <Form>
      <Stack spacing={3}>
        {status?.submitError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setStatus(undefined)}>
            {status.submitError}
          </Alert>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormField
            label="Borrower Name"
            name="name"
            value={values.name}
            error={errors.name}
            touched={touched.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter borrower name"
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            error={errors.email}
            touched={touched.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter email address"
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormField
            label="Phone Number"
            name="phone"
            value={values.phone}
            error={errors.phone}
            touched={touched.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter phone number"
          />
          <FormField
            label="Loan Amount"
            name="loanAmount"
            type="number"
            value={values.loanAmount || ''}
            error={errors.loanAmount}
            touched={touched.loanAmount}
            onChange={handleLoanAmountChange}
            onBlur={handleBlur}
            placeholder="0.00"
            inputProps={{ step: '0.01', min: '0' }}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormSelectField
            label="Status"
            name="status"
            value={values.status}
            error={errors.status}
            touched={touched.status}
            onChange={handleChange}
            onBlur={handleBlur}
            options={BORROWER_STATUS_OPTIONS}
          />
          <FormSelectField
            label="Rating"
            name="rating"
            value={values.rating}
            error={errors.rating}
            touched={touched.rating}
            onChange={handleChange}
            onBlur={handleBlur}
            options={BORROWER_RATING_OPTIONS}
          />
        </Stack>
        <FormField
          label="Address"
          name="address"
          value={values.address}
          error={errors.address}
          touched={touched.address}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter full address"
          multiline
          rows={3}
        />
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onCancel}
            disabled={isSubmitting}
          >
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
  );
}

export function BorrowerFormView({ isEdit = false, initialData }: BorrowerFormViewProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleSubmit = async (
    values: BorrowerFormData,
    { setStatus }: { setStatus: (s: any) => void }
  ) => {
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
        <Button
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          onClick={() => navigate('/borrower-management')}
          color="inherit"
          variant="text"
        >
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
          validateOnChange={false}
          validateOnBlur
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
            setStatus,
            isSubmitting,
            status,
          }) => (
            <BorrowerFormFields
              values={values}
              errors={errors}
              touched={touched}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              setStatus={setStatus}
              isSubmitting={isSubmitting}
              status={status}
              onCancel={() => navigate('/borrower-management')}
              isEdit={isEdit}
            />
          )}
        </Formik>
      </Card>
    </DashboardContent>
  );
}

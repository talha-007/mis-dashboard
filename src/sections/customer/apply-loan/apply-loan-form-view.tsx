import type { CustomerLoanApplication } from 'src/_mock/_customer-loan-application';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useParams, useRouter } from 'src/routes/hooks';

import { useAppSelector } from 'src/redux/store';
import { DashboardContent } from 'src/layouts/dashboard';
import loanApplicationService from 'src/redux/services/loan-applications';

import { FormField } from 'src/components/form';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type LoanFormValues = {
  customerName: string;
  fatherName: string;
  cnic: string;
  city: string;
  region: string;
  loanAmount: number | '';
  durationMonths: number | '';
};

const defaultValues: LoanFormValues = {
  customerName: '',
  fatherName: '',
  cnic: '',
  city: '',
  region: '',
  loanAmount: '',
  durationMonths: '',
};

// CNIC format: XXXXX-XXXXXXX-X (5 digits, dash, 7 digits, dash, 1 digit)
const cnicPattern = /^\d{5}-\d{7}-\d$/;

/** Format raw input to XXXXX-XXXXXXX-X; only allows digits, auto-inserts hyphens. */
function formatCnicInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

const loanSchema = Yup.object({
  customerName: Yup.string()
    .required('Customer name is required')
    .trim()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must be at most 100 characters'),
  fatherName: Yup.string()
    .required('Father name is required')
    .trim()
    .min(2, 'Father name must be at least 2 characters')
    .max(100, 'Father name must be at most 100 characters'),
  cnic: Yup.string()
    .required('CNIC is required')
    .trim()
    .matches(cnicPattern, 'CNIC must be in format XXXXX-XXXXXXX-X'),
  city: Yup.string()
    .required('City is required')
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(80, 'City must be at most 80 characters'),
  region: Yup.string()
    .required('Region is required')
    .trim()
    .min(2, 'Region must be at least 2 characters')
    .max(80, 'Region must be at most 80 characters'),
  loanAmount: Yup.number()
    .typeError('Loan amount must be a number')
    .required('Loan amount is required')
    .min(1000, 'Loan amount must be at least 1,000')
    .positive('Loan amount must be greater than 0'),
  durationMonths: Yup.number()
    .typeError('Duration must be a number')
    .integer('Duration must be a whole number of months')
    .required('Duration is required')
    .min(1, 'Duration must be at least 1 month')
    .max(360, 'Duration must be at most 360 months'),
});

// ----------------------------------------------------------------------

type ApplyLoanFormViewProps = {
  /** When true, render only the form card (no page title, no DashboardContent wrapper). Used inside ApplyLoanFlowView step 2. */
  embedded?: boolean;
  /** When provided (e.g. from apply-loan flow after assessment), sent in create payload so backend can link loan to assessment. */
  assessment_id?: string;
};

export function ApplyLoanFormView({ embedded, assessment_id }: ApplyLoanFormViewProps) {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [existing, setExisting] = useState<CustomerLoanApplication | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(!!id && id !== 'new');

  useEffect(() => {
    if (!id || id === 'new') {
      setExisting(null);
      setLoadingEdit(false);
      return undefined;
    }
    let cancelled = false;
    setLoadingEdit(true);
    loanApplicationService
      .get(id)
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.data ?? res.data;
        if (!raw) {
          setExisting(null);
          return;
        }
        const d = raw as Record<string, unknown>;
        setExisting({
          id: String(d.id ?? d._id ?? id),
          customerName: String(d.customerName ?? d.name ?? ''),
          fatherName: String(d.fatherName ?? ''),
          cnic: String(d.cnic ?? ''),
          city: String(d.city ?? ''),
          region: String(d.region ?? ''),
          loanAmount: Number(d.loanAmount ?? 0),
          installmentAmount: Number(d.installmentAmount ?? 0),
          businessIncome: 0,
          investmentIncome: 0,
          salaryIncome: 0,
          houseRental: 0,
          carRental: 0,
          utilitiesBill: 0,
          installmentsOther: 0,
          fuelExpenses: 0,
          groceryExpenses: 0,
          medicalBills: 0,
          insurance: 0,
          fees: 0,
          otherExpenses: 0,
          miscellaneous: 0,
          status: (d.status as CustomerLoanApplication['status']) ?? 'submitted',
          createdAt: String(d.createdAt ?? ''),
          updatedAt: String(d.updatedAt ?? ''),
        });
      })
      .catch(() => {
        if (!cancelled) setExisting(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingEdit(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const initialValues: LoanFormValues = useMemo(() => {
    if (!existing) return defaultValues;
    return {
      customerName: existing.customerName,
      fatherName: existing.fatherName,
      cnic: existing.cnic ? formatCnicInput(existing.cnic) : '',
      city: existing.city,
      region: existing.region,
      loanAmount: existing.loanAmount,
      durationMonths:
        existing.installmentAmount && existing.installmentAmount > 0
          ? Math.round(existing.loanAmount / existing.installmentAmount)
          : 24,
    };
  }, [existing]);

  const formik = useFormik<LoanFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: loanSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      const amount = Number(values.loanAmount) || 0;
      const duration = Number(values.durationMonths) || 1;
      const installmentAmount = duration > 0 ? Math.round(amount / duration) : amount;

      const payload: Record<string, unknown> = {
        customerName: values.customerName.trim(),
        fatherName: values.fatherName.trim(),
        cnic: values.cnic.trim(),
        city: values.city.trim(),
        region: values.region.trim(),
        loanAmount: amount,
        durationMonths: duration,
        installmentAmount,
        bankSlug: user?.bankSlug ?? '',
      };
      if (assessment_id) {
        payload.assessment_id = assessment_id;
      }

      try {
        if (existing?.id) {
          await loanApplicationService.update(existing.id, payload);
        } else {
          await loanApplicationService.create(payload);
        }
        router.push('/apply-loan');
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Failed to submit application. Please try again.';
        formik.setStatus({ submitError: msg });
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    status,
    setStatus,
    setFieldValue,
  } = formik;

  const handleCnicChange = useCallback(
    (e: React.ChangeEvent<unknown>) => {
      const target = (e as React.ChangeEvent<HTMLInputElement>).target;
      setFieldValue('cnic', formatCnicInput(target.value));
    },
    [setFieldValue]
  );

  const installmentAmount =
    values.loanAmount && values.durationMonths
      ? Math.round(Number(values.loanAmount) / Number(values.durationMonths))
      : 0;

  const title = existing ? 'Edit Loan Application' : 'New Loan Application';

  if (loadingEdit) {
    return (
      <DashboardContent>
        <Container maxWidth="md">
          <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading application...
            </Typography>
          </Stack>
        </Container>
      </DashboardContent>
    );
  }

  if (id && id !== 'new' && !existing) {
    return (
      <DashboardContent>
        <Container maxWidth="md">
          <Alert severity="warning" sx={{ mb: 2 }}>
            Application not found or you don&apos;t have access to it.
          </Alert>
          <Button
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => router.push('/apply-loan')}
          >
            Back to applications
          </Button>
        </Container>
      </DashboardContent>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} noValidate>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          {status?.submitError && (
            <Alert severity="error" onClose={() => setStatus(undefined)}>
              {status.submitError}
            </Alert>
          )}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Basic information
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  label="Customer name"
                  name="customerName"
                  value={values.customerName}
                  error={errors.customerName}
                  touched={touched.customerName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  label="Father name"
                  name="fatherName"
                  value={values.fatherName}
                  error={errors.fatherName}
                  touched={touched.fatherName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
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
                  placeholder="42301-1234567-8"
                  inputProps={{ maxLength: 15, inputMode: 'numeric', autoComplete: 'off' }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormField
                  label="City"
                  name="city"
                  value={values.city}
                  error={errors.city}
                  touched={touched.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormField
                  label="Region"
                  name="region"
                  value={values.region}
                  error={errors.region}
                  touched={touched.region}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Loan details
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  label="Loan amount"
                  name="loanAmount"
                  type="number"
                  value={values.loanAmount}
                  error={errors.loanAmount}
                  touched={touched.loanAmount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                  }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  label="Duration (months)"
                  name="durationMonths"
                  type="number"
                  value={values.durationMonths}
                  error={errors.durationMonths}
                  touched={touched.durationMonths}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Estimated installment"
                  value={installmentAmount.toLocaleString()}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                  }}
                  helperText="Auto-calculated based on amount and duration"
                  disabled
                />
              </Grid>
            </Grid>
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={() => router.push('/apply-loan')}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting
                ? 'Submitting...'
                : existing
                  ? 'Update application'
                  : 'Submit application'}
            </Button>
          </Box>
        </Stack>
      </Card>
    </form>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <DashboardContent>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">{title}</Typography>
            <Button variant="text" onClick={() => router.push('/apply-loan')}>
              Back to applications
            </Button>
          </Stack>
          {formContent}
        </Stack>
      </Container>
    </DashboardContent>
  );
}

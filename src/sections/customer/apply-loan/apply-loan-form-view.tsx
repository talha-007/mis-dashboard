import type { CustomerLoanApplication } from 'src/_mock/_customer-loan-application';

import { useMemo } from 'react';

import { useParams, useRouter } from 'src/routes/hooks';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'customer_loan_applications';

function loadApplications(): CustomerLoanApplication[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveApplications(apps: CustomerLoanApplication[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch {
    // ignore
  }
}

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

const loanSchema = Yup.object({
  customerName: Yup.string().required('Customer name is required').trim(),
  fatherName: Yup.string().required('Father name is required').trim(),
  cnic: Yup.string().required('CNIC is required').trim(),
  city: Yup.string().required('City is required').trim(),
  region: Yup.string().required('Region is required').trim(),
  loanAmount: Yup.number()
    .typeError('Loan amount must be a number')
    .positive('Loan amount must be greater than 0')
    .required('Loan amount is required'),
  durationMonths: Yup.number()
    .typeError('Duration must be a number')
    .integer('Duration must be a whole number of months')
    .positive('Duration must be greater than 0')
    .required('Duration is required'),
});

// ----------------------------------------------------------------------

type ApplyLoanFormViewProps = {
  /** When true, render only the form card (no page title, no DashboardContent wrapper). Used inside ApplyLoanFlowView step 2. */
  embedded?: boolean;
};

export function ApplyLoanFormView({ embedded }: ApplyLoanFormViewProps) {
  const { id } = useParams();
  const router = useRouter();

  const existing = useMemo(() => {
    if (!id) return null;
    const apps = loadApplications();
    return apps.find((a) => a.id === id) ?? null;
  }, [id]);

  const initialValues: LoanFormValues = existing
    ? {
        customerName: existing.customerName,
        fatherName: existing.fatherName,
        cnic: existing.cnic,
        city: existing.city,
        region: existing.region,
        loanAmount: existing.loanAmount,
        durationMonths:
          existing.installmentAmount && existing.installmentAmount > 0
            ? Math.round(existing.loanAmount / existing.installmentAmount)
            : 24,
      }
    : defaultValues;

  const formik = useFormik<LoanFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: loanSchema,
    onSubmit: async (values) => {
      const apps = loadApplications();
      const now = new Date().toISOString().split('T')[0];

      const amount = Number(values.loanAmount) || 0;
      const duration = Number(values.durationMonths) || 1;
      const installmentAmount = duration > 0 ? Math.round(amount / duration) : amount;

      const base: CustomerLoanApplication = {
        id: existing?.id ?? `APP-${Date.now()}`,
        customerName: values.customerName,
        fatherName: values.fatherName,
        cnic: values.cnic,
        city: values.city,
        region: values.region,
        loanAmount: amount,
        installmentAmount,
        // Income/expenses removed from UI; keep as 0 for now
        businessIncome: existing?.businessIncome ?? 0,
        investmentIncome: existing?.investmentIncome ?? 0,
        salaryIncome: existing?.salaryIncome ?? 0,
        houseRental: existing?.houseRental ?? 0,
        carRental: existing?.carRental ?? 0,
        utilitiesBill: existing?.utilitiesBill ?? 0,
        installmentsOther: existing?.installmentsOther ?? 0,
        fuelExpenses: existing?.fuelExpenses ?? 0,
        groceryExpenses: existing?.groceryExpenses ?? 0,
        medicalBills: existing?.medicalBills ?? 0,
        insurance: existing?.insurance ?? 0,
        fees: existing?.fees ?? 0,
        otherExpenses: existing?.otherExpenses ?? 0,
        miscellaneous: existing?.miscellaneous ?? 0,
        status: existing?.status ?? 'submitted',
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      const updated = existing
        ? apps.map((a) => (a.id === existing.id ? base : a))
        : [...apps, base];

      saveApplications(updated);
      router.push('/apply-loan');
    },
  });

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = formik;

  const installmentAmount =
    values.loanAmount && values.durationMonths
      ? Math.round(Number(values.loanAmount) / Number(values.durationMonths))
      : 0;

  const title = existing ? 'Edit Loan Application' : 'New Loan Application';

  const formContent = (
    <form onSubmit={handleSubmit} noValidate>
      <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Basic information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Customer name"
                        name="customerName"
                        value={values.customerName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.customerName && errors.customerName)}
                        helperText={touched.customerName && errors.customerName}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Father name"
                        name="fatherName"
                        value={values.fatherName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.fatherName && errors.fatherName)}
                        helperText={touched.fatherName && errors.fatherName}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="CNIC"
                        name="cnic"
                        value={values.cnic}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.cnic && errors.cnic)}
                        helperText={touched.cnic && errors.cnic}
                        placeholder="42301-1234567-8"
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={values.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.city && errors.city)}
                        helperText={touched.city && errors.city}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        fullWidth
                        label="Region"
                        name="region"
                        value={values.region}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.region && errors.region)}
                        helperText={touched.region && errors.region}
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
                      <TextField
                        fullWidth
                        label="Loan amount"
                        name="loanAmount"
                        type="number"
                        value={values.loanAmount}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.loanAmount && errors.loanAmount)}
                        helperText={touched.loanAmount && errors.loanAmount}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                        }}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Duration (months)"
                        name="durationMonths"
                        type="number"
                        value={values.durationMonths}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.durationMonths && errors.durationMonths)}
                        helperText={touched.durationMonths && errors.durationMonths}
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
                    {isSubmitting ? 'Submitting...' : existing ? 'Update application' : 'Submit application'}
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


/**
 * Employee Apply Loan Dialog
 * Two-step flow: (1) Assessment (bank questions) (2) Loan form
 * Submits via POST /api/v1/employee/loan-applications
 */

import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import { useFormik } from 'formik';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Step from '@mui/material/Step';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';

import { useAppSelector } from 'src/store';
import { getBankData, getBankSlugFromStorage } from 'src/utils/auth-storage';
import { getCurrentBankSlug } from 'src/utils/bank-context';
import customerService from 'src/redux/services/customer.services';
import employeeService from 'src/redux/services/employee.services';

import { FormField } from 'src/components/form';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const cnicPattern = /^\d{5}-\d{7}-\d$/;

function formatCnicInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

function calcEMI(principal: number, annualRatePercent: number, months: number): number {
  if (months <= 0) return principal;
  const r = annualRatePercent / 100 / 12;
  if (r <= 0) return Math.round(principal / months);
  const factor = (1 + r) ** months;
  return Math.round((principal * r * factor) / (factor - 1));
}

const loanSchema = Yup.object({
  customerName: Yup.string().required('Customer name is required').trim().min(2).max(100),
  fatherName: Yup.string().required('Father name is required').trim().min(2).max(100),
  cnic: Yup.string().required('CNIC is required').trim().matches(cnicPattern, 'Format: XXXXX-XXXXXXX-X'),
  city: Yup.string().required('City is required').trim().min(2).max(80),
  region: Yup.string().required('Region is required').trim().min(2).max(80),
  loanAmount: Yup.number()
    .typeError('Loan amount must be a number')
    .required('Required')
    .min(1000, 'Min 1,000')
    .positive(),
  durationMonths: Yup.number()
    .typeError('Duration must be a number')
    .required('Required')
    .integer()
    .min(1)
    .max(360),
});

type LoanFormValues = {
  customerName: string;
  fatherName: string;
  cnic: string;
  city: string;
  region: string;
  loanAmount: number | '';
  durationMonths: number | '';
};

// ----------------------------------------------------------------------

type FieldValuesState = Record<string, string>;

function AssessmentStep({
  bankSlug,
  customerId,
  onComplete,
}: {
  bankSlug: string | null;
  customerId: string;
  onComplete: (result: { assessment_id?: string }) => void;
}) {
  const [assessment, setAssessment] = useState<{ questions: Array<{ _id: string; fieldKey: string; label: string; questionType?: string; unit?: string }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<FieldValuesState>({});

  const fetchAssessment = useCallback(async () => {
    if (!bankSlug) {
      setAssessment({ questions: [] });
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await customerService.getBankQuestionsForCustomer(bankSlug);
      const data = res.data?.bankQuestions ?? res.data?.data ?? res.data;
      const questions = (data?.questions ?? [])
        .filter((q: any) => q.type === 'custom_field' || !q.options?.length)
        .map((q: any, index: number) => ({
          _id: String(q._id ?? q.id ?? index),
          fieldKey: q.fieldKey ?? q.label ?? `field_${index + 1}`,
          label: q.label ?? q.fieldKey ?? q.text ?? `Field ${index + 1}`,
          questionType: q.questionType === 'expense' ? 'expense' : 'income',
          unit: q.unit,
        }));
      setAssessment({ questions });
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to load assessment');
      setAssessment(null);
    } finally {
      setLoading(false);
    }
  }, [bankSlug]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  const customFields = assessment?.questions ?? [];
  const allFilled =
    customFields.length > 0 &&
    customFields.every((f) => {
      const v = fieldValues[f._id]?.trim();
      if (!v) return false;
      const num = Number(v);
      return !Number.isNaN(num) && num >= 0;
    });

  const handleSubmit = async () => {
    if (!allFilled || !assessment) return;
    try {
      setSubmitting(true);
      setError(null);
      const answers = customFields
        .filter((f) => fieldValues[f._id]?.trim())
        .map((f) => ({ fieldKey: f.fieldKey, amount: Number(fieldValues[f._id]) || 0 }));
      const res = await employeeService.submitAssessmentOnBehalf(
        customerId,
        bankSlug ?? '',
        answers
      );
      const result = res.data?.data ?? res.data ?? {};
      toast.success('Assessment submitted');
      onComplete({ assessment_id: result?.assessment_id ?? result?.assessmentId });
    } catch (err: unknown) {
      const errAny = err as any;
      setError(
        errAny?.response?.data?.message ?? errAny?.response?.data?.error ?? errAny?.message ?? 'Failed to submit'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
        <CircularProgress />
      </Box>
    );
  }

  if (!customFields.length) {
    return (
      <Alert severity="info">
        No assessment questions available. You can continue to the loan form.
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => onComplete({})}>
          Continue to loan details
        </Button>
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary">
        Enter income and expense amounts for this customer.
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {customFields.map((field) => (
        <Card key={field._id} sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {field.label}
            {field.questionType && (
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                ({field.questionType})
              </Typography>
            )}
          </Typography>
          <TextField
            fullWidth
            type="number"
            size="small"
            value={fieldValues[field._id] ?? ''}
            onChange={(e) => setFieldValues((prev) => ({ ...prev, [field._id]: e.target.value }))}
            placeholder={field.unit ? `Amount in ${field.unit}` : 'Enter amount'}
            inputProps={{ min: 0, step: 1 }}
            InputProps={{
              endAdornment: field.unit ? (
                <InputAdornment position="end">{field.unit}</InputAdornment>
              ) : undefined,
            }}
          />
        </Card>
      ))}
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!allFilled || submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : <Iconify icon="solar:check-circle-bold" />}
        >
          {submitting ? 'Submitting...' : 'Complete assessment & continue'}
        </Button>
      </Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function EmployeeApplyLoanDialog({
  open,
  onClose,
  onSuccess,
  customerId,
  customer: initialCustomer,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customerId: string;
  customer?: { name?: string; lastname?: string; cnic?: string; city?: string; region?: string; bankSlug?: string };
}) {
  const { user, bank } = useAppSelector((state) => state.auth);
  const bankSlug =
    (user as { bankSlug?: string })?.bankSlug ??
    bank?.slug ??
    getBankData<{ slug?: string }>()?.slug ??
    getBankSlugFromStorage() ??
    getCurrentBankSlug();
  const [activeStep, setActiveStep] = useState(0);
  const [assessmentResult, setAssessmentResult] = useState<{ assessment_id?: string } | null>(null);
  const [rates, setRates] = useState<{
    interestRate: number | null;
    insuranceRate: number | null;
    bankName: string | null;
  }>({ interestRate: null, insuranceRate: null, bankName: null });
  const [customer, setCustomer] = useState(initialCustomer);

  // Fetch full customer when dialog opens (also may have bankSlug for questions)
  const [customerBankSlug, setCustomerBankSlug] = useState<string | null>(null);
  useEffect(() => {
    if (!open || !customerId) return;
    setCustomer(initialCustomer);
    setCustomerBankSlug(null);
    let cancelled = false;
    employeeService
      .getCustomerById(customerId)
      .then((res) => {
        if (cancelled) return;
        const d = res.data?.data ?? res.data;
        if (d) {
          setCustomer({
            name: d.name ?? d.firstName,
            lastname: d.lastname ?? d.lastName,
            cnic: d.cnic,
            city: d.city,
            region: d.region,
          });
          const custBank = d.bankSlug ?? d.bank?.slug ?? d.slug;
          if (custBank) setCustomerBankSlug(custBank);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, customerId, initialCustomer?.name, initialCustomer?.lastname]);

  useEffect(() => {
    const slug = bankSlug ?? customerBankSlug;
    if (!slug || !open) return;
    let cancelled = false;
    customerService
      .getRates(slug)
      .then((res) => {
        if (cancelled) return;
        const body = res.data?.data ?? res.data;
        setRates({
          interestRate: typeof body?.interestRate === 'number' ? body.interestRate : null,
          insuranceRate: typeof body?.insuranceRate === 'number' ? body.insuranceRate : null,
          bankName: typeof body?.bankName === 'string' ? body.bankName : null,
        });
      })
      .catch(() => {
        if (!cancelled) setRates({ interestRate: null, insuranceRate: null, bankName: null });
      });
    return () => {
      cancelled = true;
    };
  }, [bankSlug, customerBankSlug, open]);

  const handleClose = () => {
    setActiveStep(0);
    setAssessmentResult(null);
    onClose();
  };

  const defaultCustomerName = [customer?.name, customer?.lastname].filter(Boolean).join(' ') || '';
  const defaultValues: LoanFormValues = {
    customerName: defaultCustomerName || customer?.name || '',
    fatherName: '',
    cnic: customer?.cnic ? formatCnicInput(customer.cnic) : '',
    city: customer?.city || '',
    region: customer?.region || '',
    loanAmount: '',
    durationMonths: '',
  };

  const formik = useFormik<LoanFormValues>({
    initialValues: defaultValues,
    enableReinitialize: true,
    validationSchema: loanSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      const amount = Number(values.loanAmount) || 0;
      const duration = Number(values.durationMonths) || 1;
      const annualRate = rates.interestRate ?? 0;
      const installmentAmount =
        annualRate > 0 && duration > 0
          ? calcEMI(amount, annualRate, duration)
          : duration > 0
            ? Math.round(amount / duration)
            : amount;

      const payload: Record<string, unknown> = {
        customerName: values.customerName.trim(),
        fatherName: values.fatherName.trim(),
        cnic: values.cnic.trim(),
        city: values.city.trim(),
        region: values.region.trim(),
        loanAmount: amount,
        installmentAmount,
        durationMonths: duration,
        status: 'submitted',
      };
      if (assessmentResult?.assessment_id) {
        payload.assessmentId = assessmentResult.assessment_id;
      }

      try {
        await employeeService.applyLoanOnBehalf(customerId, payload);
        toast.success('Loan application submitted successfully');
        onSuccess?.();
        handleClose();
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Failed to submit application.';
        formik.setStatus({ submitError: msg });
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, status, setStatus, setFieldValue } =
    formik;

  const handleCnicChange = useCallback(
    (e: React.ChangeEvent<unknown>) => {
      const target = (e as React.ChangeEvent<HTMLInputElement>).target;
      setFieldValue('cnic', formatCnicInput(target.value));
    },
    [setFieldValue]
  );

  const principal = Number(values.loanAmount) || 0;
  const months = Number(values.durationMonths) || 0;
  const annualRate = rates.interestRate ?? 0;
  const installmentAmount =
    principal > 0 && months > 0
      ? annualRate > 0
        ? calcEMI(principal, annualRate, months)
        : Math.round(principal / months)
      : 0;

  const effectiveBankSlug = initialCustomer?.bankSlug ?? bankSlug ?? customerBankSlug;

  const steps = ['Credit assessment', 'Loan details'];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Apply Loan for Customer</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <AssessmentStep
            bankSlug={effectiveBankSlug}
            customerId={customerId}
            onComplete={(result) => {
              setAssessmentResult(result);
              setActiveStep(1);
            }}
          />
        )}

        {activeStep === 1 && (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {assessmentResult && (
                <Alert severity="success">Assessment complete. Fill in loan details below.</Alert>
              )}
              <Button
                size="small"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                onClick={() => setActiveStep(0)}
              >
                Back to assessment
              </Button>

              {status?.submitError && (
                <Alert severity="error" onClose={() => setStatus(undefined)}>
                  {status.submitError}
                </Alert>
              )}

              <Grid container spacing={2}>
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
                    inputProps={{ maxLength: 15 }}
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
                    helperText={
                      rates.interestRate != null
                        ? [
                            rates.bankName && `${rates.bankName}. `,
                            `Interest: ${rates.interestRate}% p.a.`,
                            rates.insuranceRate != null && ` Insurance: ${rates.insuranceRate}%.`,
                          ]
                            .filter(Boolean)
                            .join('') || `Based on amount, duration and ${rates.interestRate}% p.a. interest`
                        : 'Auto-calculated based on amount and duration'
                    }
                    disabled
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit application'}
                </Button>
              </Stack>
            </Stack>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

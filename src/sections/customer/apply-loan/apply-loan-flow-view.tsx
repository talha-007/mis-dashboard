/**
 * Two-step loan application flow: (1) Assessment (2) Loan details form.
 * Edit mode (apply-loan/:id) skips assessment and shows only the form.
 */

import type { BankAssessment } from 'src/types/assessment.types';

import { toast } from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Step from '@mui/material/Step';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useParams, useRouter } from 'src/routes/hooks';

import { getCurrentBankSlug } from 'src/utils/bank-context';
import { getBankData, getBankSlugFromStorage } from 'src/utils/auth-storage';

import { useAppSelector } from 'src/store';
import { DashboardContent } from 'src/layouts/dashboard';
import customerService from 'src/redux/services/customer.services';

import { Iconify } from 'src/components/iconify';

import { isCustomField, buildAssessmentSubmitAnswers } from 'src/types/assessment.types';

import { ApplyLoanFormView } from './apply-loan-form-view';

// ----------------------------------------------------------------------

type FieldValuesState = Record<string, string>;

function freeTextStorageKey(fieldId: string) {
  return `${fieldId}__note`;
}

function AssessmentStepContent({
  onComplete,
}: {
  onComplete: (result: { submissionId?: string }) => void;
}) {
  const { user, bank } = useAppSelector((state) => state.auth);
  const [assessment, setAssessment] = useState<BankAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<FieldValuesState>({});
  const [freeTextValues, setFreeTextValues] = useState<FieldValuesState>({});

  const fetchAssessment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const bankSlug =
        (user as { bankSlug?: string })?.bankSlug ??
        bank?.slug ??
        getBankData<{ slug?: string }>()?.slug ??
        getBankSlugFromStorage() ??
        getCurrentBankSlug();
      if (!bankSlug) {
        setError('Bank slug not found. Unable to load assessment.');
        setAssessment(null);
        setLoading(false);
        return;
      }

      const res = await customerService.getBankQuestionsForCustomer(bankSlug);
      const data = res.data?.bankQuestions ?? res.data?.data ?? res.data;

      const questions: BankAssessment['questions'] = (data?.questions ?? [])
        .filter((q: any) => q.type === 'custom_field' || !q.options?.length)
        .map((q: any, index: number) => ({
          _id: String(q._id ?? q.id ?? index),
          type: 'custom_field' as const,
          fieldKey: q.fieldKey ?? q.label ?? `field_${index + 1}`,
          label: q.label ?? q.fieldKey ?? q.text ?? `Field ${index + 1}`,
          inputType: 'number' as const,
          order: q.order ?? index + 1,
          unit: q.unit,
          questionType: q.questionType === 'expense' ? 'expense' : 'income',
          allowFreeText: Boolean(q.allowFreeText),
          freeTextLabel: typeof q.freeTextLabel === 'string' ? q.freeTextLabel : undefined,
        }));

      setAssessment({
        slug: bankSlug,
        questions,
        totalMaxScore: 0,
      });
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to load assessment');
      setAssessment(null);
    } finally {
      setLoading(false);
    }
  }, [user, bank]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  const customFields = assessment?.questions?.filter(isCustomField) ?? [];

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

      const answers = buildAssessmentSubmitAnswers(
        customFields,
        fieldValues,
        freeTextValues,
        freeTextStorageKey
      );

      const bankSlugForSubmit =
        (user as { bankSlug?: string })?.bankSlug ??
        bank?.slug ??
        getBankSlugFromStorage() ??
        '';
      const submitPayload = {
        bankSlug: bankSlugForSubmit,
        answers,
      };

      const res = await customerService.submitAssessmentAnswers(submitPayload);
      if (res.status === 201) {
        const result = res.data;
        toast.success(result.message);
        onComplete({ submissionId: result?.assessment_id });
      }
    } catch (err: unknown) {
      const errAny = err as any;
      const serverMessage =
        errAny?.response?.data?.message ??
        errAny?.response?.data?.error ??
        errAny?.response?.data?.msg ??
        errAny?.message;
      setError(serverMessage || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={320}>
        <CircularProgress />
      </Box>
    );
  }

  if (!customFields.length) {
    return (
      <Alert severity="info">
        No assessment is available at the moment. You can still continue to the loan form.
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => onComplete({ submissionId: undefined })}
        >
          Continue to loan details
        </Button>
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary">
        Enter your income and expense amounts below. Your responses will be reviewed with your loan
        application.
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {customFields.map((field, index) => (
        <Card key={field._id} sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {index + 1}. {field.label}
            {field.questionType && (
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                ({field.questionType})
              </Typography>
            )}
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={fieldValues[field._id] ?? ''}
            onChange={(e) => setFieldValues((prev) => ({ ...prev, [field._id]: e.target.value }))}
            placeholder={`Enter amount${field.unit ? ` in ${field.unit}` : ''}`}
            inputProps={{ min: 0, step: 1 }}
            InputProps={{
              endAdornment: field.unit ? (
                <InputAdornment position="end">{field.unit}</InputAdornment>
              ) : undefined,
            }}
          />
          {field.allowFreeText && (
            <TextField
              fullWidth
              multiline
              minRows={2}
              sx={{ mt: 2 }}
              value={freeTextValues[freeTextStorageKey(field._id)] ?? ''}
              onChange={(e) =>
                setFreeTextValues((prev) => ({
                  ...prev,
                  [freeTextStorageKey(field._id)]: e.target.value,
                }))
              }
              label={field.freeTextLabel || 'Additional details (optional)'}
              placeholder="Optional"
            />
          )}
        </Card>
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!allFilled || submitting}
          startIcon={
            submitting ? <CircularProgress size={20} /> : <Iconify icon="solar:check-circle-bold" />
          }
        >
          {submitting ? 'Submitting...' : 'Complete assessment & continue'}
        </Button>
      </Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function ApplyLoanFlowView() {
  const { id } = useParams();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [assessmentResult, setAssessmentResult] = useState<{
    submissionId?: string;
  } | null>(null);

  const isEditMode = !!id && id !== 'new';

  if (isEditMode) {
    return <ApplyLoanFormView />;
  }

  const steps = ['Credit assessment', 'Loan details'];

  return (
    <DashboardContent>
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">New loan application</Typography>
            <Button
              variant="text"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => router.push('/apply-loan')}
            >
              Back to applications
            </Button>
          </Stack>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <AssessmentStepContent
              onComplete={(result) => {
                setAssessmentResult({ submissionId: result?.submissionId });
                setActiveStep(1);
              }}
            />
          )}

          {activeStep === 1 && (
            <Stack spacing={2}>
              {assessmentResult && (
                <Alert severity="success">
                  Assessment complete. Fill in your details below to submit your loan application.
                </Alert>
              )}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Button
                  startIcon={<Iconify icon="eva:arrow-back-fill" />}
                  onClick={() => setActiveStep(0)}
                >
                  Back to assessment
                </Button>
              </Stack>
              <ApplyLoanFormView embedded assessment_id={assessmentResult?.submissionId} />
            </Stack>
          )}
        </Stack>
      </Box>
    </DashboardContent>
  );
}

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
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useParams, useRouter } from 'src/routes/hooks';

import { useAppSelector } from 'src/store';
import { DashboardContent } from 'src/layouts/dashboard';
import customerService from 'src/redux/services/customer.services';

import { Iconify } from 'src/components/iconify';

import { isMultipleChoice } from 'src/types/assessment.types';

import { ApplyLoanFormView } from './apply-loan-form-view';

// ----------------------------------------------------------------------

type AnswerState = Record<string, string>;

function AssessmentStepContent({
  onComplete,
}: {
  onComplete: (result: { submissionId?: string }) => void;
}) {
  const { user } = useAppSelector((state) => state.auth);
  const [assessment, setAssessment] = useState<BankAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});

  const fetchAssessment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get bankSlug from user data (mapped from API slug in authSlice)

      const bankSlug = (user as any)?.bankSlug;
      if (!bankSlug) {
        setError('Bank slug not found. Unable to load assessment.');
        setAssessment(null);
        setLoading(false);
        return;
      }

      // Use new API: /api/v1/bank-questions/customer/:bankSlug
      const res = await customerService.getBankQuestionsForCustomer(bankSlug);
      console.log('[fetchAssessment] API Response:', res.data);
      // API response has structure: { bankQuestions: { questions: [...], ... }, message: "..." }
      const data = res.data?.bankQuestions ?? res.data?.data ?? res.data;
      console.log('[fetchAssessment] Extracted data:', data);
      console.log('[fetchAssessment] Questions array:', data?.questions);

      // Map the response to BankAssessment format
      const questions: BankAssessment['questions'] = (data?.questions ?? []).map(
        (q: any, index: number) => {
          if (q.type === 'multiple_choice') {
            return {
              _id: String(q._id ?? q.id ?? index),
              type: 'multiple_choice' as const,
              text: q.text,
              order: q.order ?? index + 1,
              options: (q.options ?? []).map((o: any, i: number) => ({
                _id: String(o._id ?? o.id ?? i), // Use index as fallback for _id
                text: o.text ?? o.label ?? '',
                points: Number(o.points ?? o.value ?? o.score ?? 0),
              })),
            };
          }
          return {
            _id: String(q._id ?? q.id ?? index),
            type: 'custom_field' as const,
            fieldKey: q.fieldKey ?? q.label ?? `field_${index + 1}`,
            label: q.label ?? q.fieldKey ?? `Field ${index + 1}`,
            inputType: q.inputType === 'text' ? 'text' : 'number',
            order: q.order ?? index + 1,
            unit: q.unit,
          };
        }
      );

      const totalMaxScore = questions.reduce((sum, q) => {
        if (q.type === 'multiple_choice' && q.options?.length) {
          return sum + Math.max(...q.options.map((o) => o.points));
        }
        return sum;
      }, 0);

      setAssessment({
        slug: bankSlug,
        questions,
        totalMaxScore,
      });
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to load assessment');
      setAssessment(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  const mcQuestions = assessment?.questions?.filter(isMultipleChoice) ?? [];
  const allAnswered = mcQuestions.length === 0 || mcQuestions.every((q) => answers[q._id]);

  const handleSubmit = async () => {
    if (!allAnswered || !assessment) return;
    try {
      setSubmitting(true);
      setError(null);

      const answerPayload = mcQuestions
        .filter((q) => answers[q._id])
        .map((q) => {
          const optionId = answers[q._id];
          const option = q.options.find((o) => o._id === optionId);
          return { questionId: q._id, optionId };
        });

      const submitPayload = {
        bankSlug: user?.bankSlug ?? '',
        answers: answerPayload,
      };

      // Use new API: /api/v1/assessments/submit
      const res = await customerService.submitAssessmentAnswers(submitPayload);
      if (res.status === 201) {
        const result = res.data;
        toast.success(result.message);
        onComplete({ submissionId: result?.assessment_id });
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to submit assessment');
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

  if (!mcQuestions.length) {
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
        Complete the credit assessment first. Your responses will be reviewed with your loan
        application.
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {mcQuestions.map((q, index) => (
        <Card key={q._id} sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {index + 1}. {q.text}
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={answers[q._id] ?? ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q._id]: e.target.value }))}
            >
              {q.options.map((opt) => (
                <FormControlLabel
                  key={opt._id}
                  value={opt._id}
                  control={<Radio />}
                  label={opt.text}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Card>
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
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

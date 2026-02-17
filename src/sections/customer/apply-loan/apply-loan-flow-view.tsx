/**
 * Two-step loan application flow: (1) Assessment (2) Loan details form.
 * Edit mode (apply-loan/:id) skips assessment and shows only the form.
 */

import type { BankAssessment, AssessmentAnswer, CustomFieldValue } from 'src/types/assessment.types';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useParams, useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import assessmentService from 'src/redux/services/assessment.services';

import { Iconify } from 'src/components/iconify';

import { isCustomField, isMultipleChoice } from 'src/types/assessment.types';

import { ApplyLoanFormView } from './apply-loan-form-view';

// ----------------------------------------------------------------------

type AnswerState = Record<string, string>;
type CustomFieldState = Record<string, string | number>;

function AssessmentStepContent({
  onComplete,
}: {
  onComplete: (result: { score: number; totalScore: number }) => void;
}) {
  const [assessment, setAssessment] = useState<BankAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [customValues, setCustomValues] = useState<CustomFieldState>({});

  const fetchAssessment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await assessmentService.getAssessmentForCustomer();
      setAssessment(res.data ?? null);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to load assessment');
      setAssessment(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  const mcQuestions = assessment?.questions?.filter(isMultipleChoice) ?? [];
  const customFields = assessment?.questions?.filter(isCustomField) ?? [];

  const allMcAnswered = mcQuestions.length === 0 || mcQuestions.every((q) => answers[q._id]);
  const allCustomFilled =
    customFields.length === 0 ||
    customFields.every((f) => {
      const v = customValues[f._id];
      return v !== undefined && v !== '' && String(v).trim() !== '';
    });
  const allAnswered = allMcAnswered && allCustomFilled;

  const buildAnswerPayload = (): AssessmentAnswer[] =>
    mcQuestions
      .filter((q) => answers[q._id])
      .map((q) => {
        const optionId = answers[q._id];
        const option = q.options.find((o) => o._id === optionId);
        return { questionId: q._id, optionId, points: option?.points ?? 0 };
      });

  const buildCustomFieldPayload = (): CustomFieldValue[] =>
    customFields
      .filter((f) => customValues[f._id] !== undefined && String(customValues[f._id]).trim() !== '')
      .map((f) => ({
        fieldId: f._id,
        value:
          f.inputType === 'number' ? Number(customValues[f._id]) || 0 : String(customValues[f._id]),
      }));

  const handleSubmit = async () => {
    if (!allAnswered || !assessment) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await assessmentService.submitAssessment(
        buildAnswerPayload(),
        buildCustomFieldPayload(),
        assessment.totalMaxScore ?? 100
      );
      onComplete({ score: res.data.score, totalScore: res.data.totalScore });
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

  if (!assessment?.questions?.length) {
    return (
      <Alert severity="info">
        No assessment is available at the moment. You can still continue to the loan form.
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => onComplete({ score: 0, totalScore: 100 })}>
          Continue to loan details
        </Button>
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary">
        Complete the credit assessment first. Your score will be considered with your loan application.
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {assessment.questions.map((item, index) => {
        if (isMultipleChoice(item)) {
          return (
            <Card key={item._id} sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {index + 1}. {item.text}
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  value={answers[item._id] ?? ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [item._id]: e.target.value }))}
                >
                  {item.options.map((opt) => (
                    <FormControlLabel
                      key={opt._id}
                      value={opt._id}
                      control={<Radio />}
                      label={`${opt.text} (${opt.points} pts)`}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Card>
          );
        }
        if (isCustomField(item)) {
          return (
            <Card key={item._id} sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {index + 1}. {item.label}
                {item.unit ? ` (${item.unit})` : ''}
              </Typography>
              <TextField
                fullWidth
                type={item.inputType}
                value={customValues[item._id] ?? ''}
                onChange={(e) =>
                  setCustomValues((prev) => ({
                    ...prev,
                    [item._id]:
                      item.inputType === 'number' ? Number(e.target.value) || 0 : e.target.value,
                  }))
                }
                placeholder={item.inputType === 'number' ? '0' : 'Enter value'}
              />
            </Card>
          );
        }
        return null;
      })}
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
  const [assessmentResult, setAssessmentResult] = useState<{ score: number; totalScore: number } | null>(null);

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
            <Button variant="text" startIcon={<Iconify icon="eva:arrow-back-fill" />} onClick={() => router.push('/apply-loan')}>
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
                setAssessmentResult(result);
                setActiveStep(1);
              }}
            />
          )}

          {activeStep === 1 && (
            <Stack spacing={2}>
              {assessmentResult && (
                <Alert severity="success">
                  Assessment complete: {assessmentResult.score} / {assessmentResult.totalScore} points.
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
              <ApplyLoanFormView embedded />
            </Stack>
          )}
        </Stack>
      </Box>
    </DashboardContent>
  );
}

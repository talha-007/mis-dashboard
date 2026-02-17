import type {
  BankAssessment,
  AssessmentAnswer,
  CustomFieldValue,
} from 'src/types/assessment.types';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useNavigate } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import assessmentService from 'src/redux/services/assessment.services';

import { Iconify } from 'src/components/iconify';

import { isCustomField, isMultipleChoice } from 'src/types/assessment.types';

type AnswerState = Record<string, string>; // questionId -> optionId
type CustomFieldState = Record<string, string | number>; // fieldId -> value

export function CustomerAssessmentView() {
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<BankAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [customValues, setCustomValues] = useState<CustomFieldState>({});
  const [submittedResult, setSubmittedResult] = useState<{
    score: number;
    totalScore: number;
  } | null>(null);

  const fetchAssessment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await assessmentService.getAssessmentForCustomer();
      setAssessment(res.data ?? null);
    } catch (err: any) {
      setError(err.message || 'Failed to load assessment');
      setAssessment(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  const handleOptionChange = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleCustomFieldChange = (fieldId: string, value: string | number) => {
    setCustomValues((prev) => ({ ...prev, [fieldId]: value }));
  };

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

  const buildAnswerPayload = (): AssessmentAnswer[] => {
    if (!assessment) return [];
    return mcQuestions
      .filter((q) => answers[q._id])
      .map((q) => {
        const optionId = answers[q._id];
        const option = q.options.find((o) => o._id === optionId);
        return {
          questionId: q._id,
          optionId,
          points: option?.points ?? 0,
        };
      });
  };

  const buildCustomFieldPayload = (): CustomFieldValue[] =>
    customFields
      .filter((f) => customValues[f._id] !== undefined && String(customValues[f._id]).trim() !== '')
      .map((f) => ({
        fieldId: f._id,
        value:
          f.inputType === 'number' ? Number(customValues[f._id]) || 0 : String(customValues[f._id]),
      }));

  const handleSubmit = async () => {
    if (!allAnswered) return;
    try {
      setSubmitting(true);
      setError(null);
      const answerPayload = buildAnswerPayload();
      const customPayload = buildCustomFieldPayload();
      const res = await assessmentService.submitAssessment(
        answerPayload,
        customPayload,
        assessment?.totalMaxScore ?? 100
      );
      setSubmittedResult({ score: res.data.score, totalScore: res.data.totalScore });
    } catch (err: any) {
      setError(err.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedResult) {
    const { score, totalScore } = submittedResult;
    const pct = totalScore ? Math.round((score / totalScore) * 100) : 0;
    return (
      <DashboardContent>
        <Box maxWidth={560} mx="auto" textAlign="center">
          <Typography variant="h4" sx={{ mb: 2 }}>
            Assessment complete
          </Typography>
          <Card sx={{ p: 4, mb: 3 }}>
            <Typography variant="h2" fontWeight="bold" color="primary.main">
              {score} / {totalScore}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Your credit score is {score} out of {totalScore} ({pct}%).
            </Typography>
          </Card>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You can now apply for a loan. Your score and entered details will be included for the
            bank to review.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              startIcon={<Iconify icon="solar:document-add-bold" />}
              onClick={() => navigate('/apply-loan/new')}
            >
              Apply for loan
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setSubmittedResult(null);
                setAnswers({});
                setCustomValues({});
              }}
            >
              Retake assessment
            </Button>
          </Stack>
        </Box>
      </DashboardContent>
    );
  }

  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (!assessment?.questions?.length) {
    return (
      <DashboardContent>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Credit assessment
        </Typography>
        <Alert severity="info">
          No assessment is available at the moment. Please try again later.
        </Alert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Credit assessment
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Answer the questions and fill in your income/expense details. Your credit score is out of{' '}
        {assessment.totalMaxScore} (from multiple-choice questions only).
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {assessment.questions.map((item, index) => {
          if (isMultipleChoice(item)) {
            const q = item;
            return (
              <Card key={q._id} sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  {index + 1}. {q.text}
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={answers[q._id] ?? ''}
                    onChange={(e) => handleOptionChange(q._id, e.target.value)}
                  >
                    {q.options.map((opt) => (
                      <FormControlLabel
                        key={opt._id}
                        value={opt._id}
                        control={<Radio />}
                        label={
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ width: '100%' }}
                          >
                            <span>{opt.text}</span>
                            <Typography variant="caption" color="text.secondary">
                              {opt.points} pts
                            </Typography>
                          </Stack>
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Card>
            );
          }
          if (isCustomField(item)) {
            const f = item;
            const val = customValues[f._id];
            return (
              <Card key={f._id} sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  {index + 1}. {f.label}
                  {f.unit ? ` (${f.unit})` : ''}
                </Typography>
                <TextField
                  fullWidth
                  type={f.inputType}
                  value={val ?? ''}
                  onChange={(e) =>
                    handleCustomFieldChange(
                      f._id,
                      f.inputType === 'number' ? Number(e.target.value) || 0 : e.target.value
                    )
                  }
                  placeholder={f.inputType === 'number' ? '0' : 'Enter value'}
                  inputProps={f.inputType === 'number' ? { min: 0 } : undefined}
                />
              </Card>
            );
          }
          return null;
        })}
      </Stack>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          startIcon={
            submitting ? <CircularProgress size={20} /> : <Iconify icon="solar:check-circle-bold" />
          }
        >
          {submitting ? 'Submitting...' : 'Submit assessment'}
        </Button>
      </Box>
    </DashboardContent>
  );
}

import type { BankAssessment, AssessmentAnswer } from 'src/types/assessment.types';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useNavigate } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import assessmentService from 'src/redux/services/assessment.services';

import { Iconify } from 'src/components/iconify';

import { isMultipleChoice } from 'src/types/assessment.types';

type AnswerState = Record<string, string>;

export function CustomerAssessmentView() {
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<BankAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [submittedResult, setSubmittedResult] = useState<boolean>(false);

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

  const mcQuestions = assessment?.questions?.filter(isMultipleChoice) ?? [];
  const allAnswered = mcQuestions.length === 0 || mcQuestions.every((q) => answers[q._id]);

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

  const handleSubmit = async () => {
    if (!allAnswered) return;
    try {
      setSubmitting(true);
      setError(null);
      await assessmentService.submitAssessment(
        buildAnswerPayload(),
        [],
        assessment?.totalMaxScore ?? 100
      );
      setSubmittedResult(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedResult) {
    return (
      <DashboardContent>
        <Box maxWidth={560} mx="auto" textAlign="center">
          <Typography variant="h4" sx={{ mb: 2 }}>
            Assessment complete
          </Typography>
          <Card sx={{ p: 4, mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Thank you for completing the assessment. You can now proceed to apply for a loan.
            </Typography>
          </Card>
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
                setSubmittedResult(false);
                setAnswers({});
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

  if (!mcQuestions.length) {
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
        Answer the questions below. Your responses will be reviewed with your loan application.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {mcQuestions.map((q, index) => (
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
                    label={opt.text}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Card>
        ))}
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

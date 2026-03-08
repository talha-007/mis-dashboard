import type { BankAssessment } from 'src/types/assessment.types';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useNavigate } from 'src/routes/hooks';

import { useAppSelector } from 'src/store';
import { DashboardContent } from 'src/layouts/dashboard';
import assessmentService from 'src/redux/services/assessment.services';

import { Iconify } from 'src/components/iconify';

import { isCustomField } from 'src/types/assessment.types';

type FieldValuesState = Record<string, string>;

export function CustomerAssessmentView() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [assessment, setAssessment] = useState<BankAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<FieldValuesState>({});
  const [submittedResult, setSubmittedResult] = useState<boolean>(false);

  const fetchAssessment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const bankSlug = (user as any)?.bankSlug;
      const res = await assessmentService.getAssessmentForCustomer(bankSlug);
      setAssessment(res.data ?? null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load assessment');
      setAssessment(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  const customFields = assessment?.questions?.filter(isCustomField) ?? [];

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const allFilled =
    customFields.length > 0 &&
    customFields.every((f) => {
      const v = fieldValues[f._id]?.trim();
      if (!v) return false;
      const num = Number(v);
      return !Number.isNaN(num) && num >= 0;
    });

  const buildAnswersPayload = (): { fieldKey: string; amount: number }[] =>
    customFields
      .filter((f) => fieldValues[f._id]?.trim())
      .map((f) => ({
        fieldKey: f.fieldKey,
        amount: Number(fieldValues[f._id]) || 0,
      }));

  const handleSubmit = async () => {
    if (!allFilled) return;
    const bankSlug = (user as any)?.bankSlug;
    if (!bankSlug) {
      setError('Bank not found. Unable to submit assessment.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await assessmentService.submitAssessment(bankSlug, buildAnswersPayload());
      setSubmittedResult(true);
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.response?.data?.msg ??
        err?.message;
      setError(serverMessage || 'Failed to submit assessment');
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
                setFieldValues({});
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

  if (!customFields.length) {
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
        Enter your income and expense amounts below. Your responses will be reviewed with your loan
        application.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {customFields.map((field, index) => (
          <Card key={field._id} sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              {index + 1}. {field.label}
              {field.questionType && (
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  ({field.questionType})
                </Typography>
              )}
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={fieldValues[field._id] ?? ''}
              onChange={(e) => handleFieldChange(field._id, e.target.value)}
              placeholder={`Enter amount${field.unit ? ` in ${field.unit}` : ''}`}
              inputProps={{ min: 0, step: 1 }}
              InputProps={{
                endAdornment: field.unit ? (
                  <InputAdornment position="end">{field.unit}</InputAdornment>
                ) : undefined,
              }}
            />
          </Card>
        ))}
      </Stack>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!allFilled || submitting}
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

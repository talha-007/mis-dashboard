import type {
  BankAssessment,
  AssessmentItem,
  AssessmentQuestion,
  AssessmentCustomField,
} from 'src/types/assessment.types';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import assessmentService from 'src/redux/services/assessment.services';

import { Iconify } from 'src/components/iconify';

import { isCustomField, isMultipleChoice } from 'src/types/assessment.types';

import { AssessmentQuestionDialog } from '../assessment-question-dialog';
import { AssessmentCustomFieldDialog } from '../assessment-custom-field-dialog';

function getMaxPointsForItem(item: AssessmentItem): number {
  if (!isMultipleChoice(item) || !item.options?.length) return 0;
  return Math.max(...item.options.map((o) => o.points));
}

export function AssessmentView() {
  const [assessment, setAssessment] = useState<BankAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [customFieldDialogOpen, setCustomFieldDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null);
  const [editingCustomField, setEditingCustomField] = useState<AssessmentCustomField | null>(null);

  const fetchAssessment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await assessmentService.getBankAssessment();
      setAssessment(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load assessment');
      setAssessment(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [successMessage]);

  const totalMax = assessment?.questions?.reduce((sum, q) => sum + getMaxPointsForItem(q), 0) ?? 0;

  const handleSaveAssessment = async () => {
    if (!assessment || !assessment.questions?.length) return;
    try {
      setSaving(true);
      setError(null);
      // Use bankId if available, otherwise use slug or empty string
      const bankId = assessment.bankId || assessment.slug || '';
      await assessmentService.updateBankAssessment(bankId, {
        questions: assessment.questions,
      });
      setSuccessMessage('Assessment saved successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionDialogOpen(true);
  };

  const handleAddCustomField = () => {
    setEditingCustomField(null);
    setCustomFieldDialogOpen(true);
  };

  const handleEditItem = (item: AssessmentItem) => {
    if (isMultipleChoice(item)) {
      setEditingQuestion(item);
      setEditingCustomField(null);
      setQuestionDialogOpen(true);
    } else if (isCustomField(item)) {
      setEditingCustomField(item);
      setEditingQuestion(null);
      setCustomFieldDialogOpen(true);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (!assessment) return;
    setAssessment({
      ...assessment,
      questions: assessment.questions.filter((q) => q._id !== itemId),
    });
  };

  const handleSubmitQuestion = (question: AssessmentQuestion) => {
    if (!assessment) return;
    const exists = assessment.questions.some((q) => q._id === question._id && isMultipleChoice(q));
    if (exists) {
      setAssessment({
        ...assessment,
        questions: assessment.questions.map((q) =>
          q._id === question._id && isMultipleChoice(q) ? question : q
        ),
      });
    } else {
      setAssessment({
        ...assessment,
        questions: [
          ...assessment.questions,
          { ...question, order: assessment.questions.length + 1 },
        ],
      });
    }
    setQuestionDialogOpen(false);
    setEditingQuestion(null);
  };

  const handleSubmitCustomField = (field: AssessmentCustomField) => {
    if (!assessment) return;
    const exists = assessment.questions.some((q) => q._id === field._id && isCustomField(q));
    if (exists) {
      setAssessment({
        ...assessment,
        questions: assessment.questions.map((q) =>
          q._id === field._id && isCustomField(q) ? field : q
        ),
      });
    } else {
      setAssessment({
        ...assessment,
        questions: [...assessment.questions, { ...field, order: assessment.questions.length + 1 }],
      });
    }
    setCustomFieldDialogOpen(false);
    setEditingCustomField(null);
  };

  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4">Credit assessment setup</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="text.secondary">
            Total max score (MC only): <strong>{totalMax}</strong> pts
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddQuestion}
          >
            Add question (score)
          </Button>
          {/* <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:document-text-bold" />}
            onClick={handleAddCustomField}
          >
            Add custom field
          </Button> */}
          <Button
            variant="contained"
            onClick={handleSaveAssessment}
            disabled={saving || !assessment?.questions?.length}
            startIcon={
              saving ? <CircularProgress size={18} /> : <Iconify icon="solar:diskette-bold" />
            }
          >
            {saving ? 'Saving...' : 'Save assessment'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Add <strong>multiple-choice questions</strong> and assign whatever points you want to each
        option. Add as many questions as you need.
      </Typography>

      {!assessment?.questions?.length ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No questions or fields yet. Add multiple-choice questions (for score out of 100) and/or
            custom fields (customer enters values).
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleAddQuestion}
            >
              Add question (score)
            </Button>
          </Box>
        </Card>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {assessment.questions.map((item, index) => {
            if (isMultipleChoice(item)) {
              const maxP = getMaxPointsForItem(item);
              return (
                <Card key={item._id} sx={{ p: 3 }}>
                  <Box
                    display="flex"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    gap={2}
                  >
                    <Box flex={1}>
                      <Typography variant="subtitle1">
                        {index + 1}. {item.text}{' '}
                        <Typography component="span" variant="caption" color="text.secondary">
                          (multiple choice, score)
                        </Typography>
                      </Typography>
                      <Box component="ul" sx={{ mt: 1, pl: 2, m: 0 }}>
                        {item.options.map((opt) => (
                          <li key={opt._id}>
                            <Typography variant="body2">
                              {opt.text} — <strong>{opt.points} pts</strong>
                            </Typography>
                          </li>
                        ))}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Max for this question: {maxP} pts
                      </Typography>
                    </Box>
                    <Box display="flex" gap={0.5}>
                      <IconButton size="small" onClick={() => handleEditItem(item)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteItem(item._id)}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              );
            }
            if (isCustomField(item)) {
              return (
                <Card key={item._id} sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                    <Box>
                      <Typography variant="subtitle1">
                        {index + 1}. {item.label}{' '}
                        <Typography component="span" variant="caption" color="text.secondary">
                          (custom field, no score)
                        </Typography>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Input: {item.inputType}
                        {item.unit ? ` · ${item.unit}` : ''}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={0.5}>
                      <IconButton size="small" onClick={() => handleEditItem(item)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteItem(item._id)}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              );
            }
            return null;
          })}
        </Box>
      )}

      <AssessmentQuestionDialog
        open={questionDialogOpen}
        onClose={() => {
          setQuestionDialogOpen(false);
          setEditingQuestion(null);
        }}
        onSubmit={handleSubmitQuestion}
        question={editingQuestion}
      />
      <AssessmentCustomFieldDialog
        open={customFieldDialogOpen}
        onClose={() => {
          setCustomFieldDialogOpen(false);
          setEditingCustomField(null);
        }}
        onSubmit={handleSubmitCustomField}
        field={editingCustomField}
      />
    </DashboardContent>
  );
}

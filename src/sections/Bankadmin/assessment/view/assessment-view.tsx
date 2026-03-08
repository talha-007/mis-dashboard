import type {
  BankAssessment,
  AssessmentItem,
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

import { isCustomField } from 'src/types/assessment.types';

import { AssessmentCustomFieldDialog } from '../assessment-custom-field-dialog';

export function AssessmentView() {
  const [assessment, setAssessment] = useState<BankAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [customFieldDialogOpen, setCustomFieldDialogOpen] = useState(false);
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

  const customFieldsOnly =
    assessment?.questions?.filter((q): q is AssessmentCustomField => isCustomField(q)) ?? [];

  const handleSaveAssessment = async () => {
    if (!assessment || !customFieldsOnly.length) return;
    try {
      setSaving(true);
      setError(null);
      // Use bankId if available, otherwise use slug or empty string
      const bankId = assessment.bankId || assessment.slug || '';
      await assessmentService.updateBankAssessment(bankId, {
        questions: customFieldsOnly,
      });
      setSuccessMessage('Assessment saved successfully.');
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.response?.data?.msg ??
        err?.message;
      setError(serverMessage || 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomField = () => {
    setEditingCustomField(null);
    setCustomFieldDialogOpen(true);
  };

  const handleEditItem = (item: AssessmentItem) => {
    if (isCustomField(item)) {
      setEditingCustomField(item);
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
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:document-text-bold" />}
            onClick={handleAddCustomField}
          >
            Add custom field
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAssessment}
            disabled={saving || !customFieldsOnly.length}
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
        Add <strong>custom fields</strong> for income and expense. Customers will enter numeric
        values for each field.
      </Typography>

      {!customFieldsOnly.length ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No custom fields yet. Add fields for income and expense (customers enter numeric
            values).
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:document-text-bold" />}
              onClick={handleAddCustomField}
            >
              Add custom field
            </Button>
          </Box>
        </Card>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {customFieldsOnly.map((item, index) => {
            if (isCustomField(item)) {
              return (
                <Card key={item._id} sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                    <Box>
                      <Typography variant="subtitle1">
                        {index + 1}. {item.label}{' '}
                        <Typography component="span" variant="caption" color="text.secondary">
                          (number{item.questionType ? ` · ${item.questionType}` : ''})
                          {item.unit ? ` · ${item.unit}` : ''}
                        </Typography>
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

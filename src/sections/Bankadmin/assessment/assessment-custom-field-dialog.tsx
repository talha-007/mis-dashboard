import type { QuestionCategory, AssessmentCustomField } from 'src/types/assessment.types';

import { useState, useEffect } from 'react';

import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { ASSESSMENT_CUSTOM_FIELD_OPTIONS } from 'src/types/assessment.types';

// ----------------------------------------------------------------------

type AssessmentCustomFieldDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (field: AssessmentCustomField) => void;
  field: AssessmentCustomField | null;
};

export function AssessmentCustomFieldDialog({
  open,
  onClose,
  onSubmit,
  field,
}: AssessmentCustomFieldDialogProps) {
  const isEdit = !!field;
  const [fieldKey, setFieldKey] = useState('');
  const [label, setLabel] = useState('');
  const [unit, setUnit] = useState('');
  const [questionType, setQuestionType] = useState<QuestionCategory>('income');
  const [allowFreeText, setAllowFreeText] = useState(false);
  const [freeTextLabel, setFreeTextLabel] = useState('');

  useEffect(() => {
    if (open) {
      if (field) {
        setFieldKey(field.fieldKey);
        setLabel(field.label);
        setUnit(field.unit ?? '');
        setQuestionType(field.questionType ?? 'income');
        setAllowFreeText(Boolean(field.allowFreeText));
        setFreeTextLabel(field.freeTextLabel ?? '');
      } else {
        setFieldKey('');
        setLabel('');
        setUnit('');
        setQuestionType('income');
        setAllowFreeText(false);
        setFreeTextLabel('');
      }
    }
  }, [open, field]);

  const handlePredefinedSelect = (key: string) => {
    const opt = ASSESSMENT_CUSTOM_FIELD_OPTIONS.find((o) => o.fieldKey === key);
    if (opt) {
      setFieldKey(opt.fieldKey);
      setLabel(opt.label);
    }
  };

  const isValid = (fieldKey.trim() && label.trim()) || label.trim();

  const handleSubmit = () => {
    if (!label.trim()) return;
    onSubmit({
      _id: field?._id ?? `f-${Date.now()}`,
      type: 'custom_field',
      fieldKey: (fieldKey || label.replace(/\s+/g, '_').toLowerCase()).trim(),
      label: label.trim(),
      inputType: 'number',
      order: field?.order ?? 0,
      unit: unit.trim() || undefined,
      questionType,
      allowFreeText: allowFreeText || undefined,
      freeTextLabel: allowFreeText ? freeTextLabel.trim() || undefined : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit custom field' : 'Add custom field'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Customer will enter a numeric value for this field. Specify whether it is income or
          expense.
        </Typography>
        <TextField
          select
          fullWidth
          label="Predefined field (optional)"
          value={fieldKey}
          onChange={(e) => handlePredefinedSelect(e.target.value)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Custom label below</MenuItem>
          {ASSESSMENT_CUSTOM_FIELD_OPTIONS.map((opt) => (
            <MenuItem key={opt.fieldKey} value={opt.fieldKey}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Field label (shown to customer)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Salary Income (PKR/month)"
          sx={{ mb: 2 }}
        />
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Category</FormLabel>
          <RadioGroup
            row
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value as QuestionCategory)}
          >
            <FormControlLabel value="income" control={<Radio />} label="Income" />
            <FormControlLabel value="expense" control={<Radio />} label="Expense" />
          </RadioGroup>
        </FormControl>
        <TextField
          fullWidth
          label="Unit (optional)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="e.g. PKR/month"
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={allowFreeText}
              onChange={(e) => setAllowFreeText(e.target.checked)}
              color="primary"
            />
          }
          label="Allow optional text with the amount"
        />
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2, pl: 0.5 }}>
          When on, customers see an extra text field under the amount (same field key in submit).
        </Typography>
        {allowFreeText && (
          <TextField
            fullWidth
            label="Label for optional text (optional)"
            value={freeTextLabel}
            onChange={(e) => setFreeTextLabel(e.target.value)}
            placeholder="e.g. Explain or add context"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid}>
          {isEdit ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

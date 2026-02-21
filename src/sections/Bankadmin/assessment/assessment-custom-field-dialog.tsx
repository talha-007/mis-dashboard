import type { AssessmentCustomField } from 'src/types/assessment.types';

import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

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
  const [inputType, setInputType] = useState<'number' | 'text'>('number');
  const [unit, setUnit] = useState('');

  useEffect(() => {
    if (open) {
      if (field) {
        setFieldKey(field.fieldKey);
        setLabel(field.label);
        setInputType(field.inputType);
        setUnit(field.unit ?? '');
      } else {
        setFieldKey('');
        setLabel('');
        setInputType('number');
        setUnit('');
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
      inputType,
      order: field?.order ?? 0,
      unit: unit.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit custom field' : 'Add custom field'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Customer will enter a value for this field. It does not affect the credit score (score
          comes only from multiple-choice questions).
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
        <TextField
          select
          fullWidth
          label="Input type"
          value={inputType}
          onChange={(e) => setInputType(e.target.value as 'number' | 'text')}
          sx={{ mb: 2 }}
        >
          <MenuItem value="number">Number</MenuItem>
          <MenuItem value="text">Text</MenuItem>
        </TextField>
        <TextField
          fullWidth
          label="Unit (optional)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="e.g. PKR/month"
        />
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

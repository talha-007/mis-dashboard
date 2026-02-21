import type { AssessmentOption, AssessmentQuestion } from 'src/types/assessment.types';

import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Multiple-choice: bank admin sets whatever points they want per option. No fixed total.
// ----------------------------------------------------------------------

type AssessmentQuestionDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (question: AssessmentQuestion) => void;
  question: AssessmentQuestion | null;
};

export function AssessmentQuestionDialog({
  open,
  onClose,
  onSubmit,
  question,
}: AssessmentQuestionDialogProps) {
  const isEdit = !!question;
  const [text, setText] = useState('');
  const [options, setOptions] = useState<AssessmentOption[]>([]);

  useEffect(() => {
    if (open) {
      setText(question?.text ?? '');
      setOptions(
        question?.options?.length
          ? question.options.map((o) => ({ ...o }))
          : [{ _id: `opt-${Date.now()}`, text: '', points: 0 }]
      );
    }
  }, [open, question]);

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      { _id: `opt-${Date.now()}-${prev.length}`, text: '', points: 0 },
    ]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 1) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: 'text' | 'points', value: string | number) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)));
  };

  const questionMax = options.length ? Math.max(...options.map((o) => Number(o.points) || 0)) : 0;
  const isValid = text.trim() && options.filter((o) => o.text.trim()).length >= 1;

  const handleSubmit = () => {
    if (!isValid) return;
    const validOptions = options
      .filter((o) => o.text.trim())
      .map((o) => ({ ...o, points: Number(o.points) || 0 }));
    if (!validOptions.length) return;
    onSubmit({
      _id: question?._id ?? `q-${Date.now()}`,
      type: 'multiple_choice',
      text: text.trim(),
      order: question?.order ?? 0,
      options: validOptions,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit question' : 'Add question'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Assign any points you want to each option. The customer’s score will be the sum of points
          from their chosen options. This question’s max: <strong>{questionMax} pts</strong>.
        </Typography>
        <TextField
          fullWidth
          label="Question text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Options (customer picks one) — set points per option
        </Typography>
        {options.map((opt, index) => (
          <Card
            key={opt._id}
            sx={{ p: 2, mb: 1.5, display: 'flex', gap: 1, alignItems: 'flex-start' }}
          >
            <TextField
              size="small"
              label="Option text"
              value={opt.text}
              onChange={(e) => updateOption(index, 'text', e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="number"
              label="Points"
              value={opt.points}
              onChange={(e) => updateOption(index, 'points', Number(e.target.value) || 0)}
              inputProps={{ min: 0, step: 0.5 }}
              sx={{ width: 120 }}
            />
            <IconButton
              size="small"
              color="error"
              onClick={() => removeOption(index)}
              disabled={options.length <= 1}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Card>
        ))}
        <Button
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={addOption}
          variant="outlined"
          size="small"
        >
          Add option
        </Button>
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

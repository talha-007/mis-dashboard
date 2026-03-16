import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import type { EmployeeProps } from './employee-table-row';

// ----------------------------------------------------------------------

const PHONE_REGEX = /^[+]?[\d\s\-()]{10,20}$/;

function isValidPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15 && PHONE_REGEX.test(phone.trim());
}

// ----------------------------------------------------------------------

type EmployeeFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'add' | 'edit';
  initialData?: EmployeeProps | null;
  onSubmit: (data: { name: string; email: string; phone: string; password?: string }) => Promise<void>;
};

export function EmployeeFormDialog({
  open,
  onClose,
  onSuccess,
  mode,
  initialData,
  onSubmit,
}: EmployeeFormDialogProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) {
      setFormError(null);
      if (isEdit && initialData) {
        setForm({
          name: initialData.name || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          password: '',
        });
      } else {
        setForm({ name: '', email: '', phone: '', password: '' });
      }
    }
  }, [open, isEdit, initialData]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setFormError('Name, email and phone are required');
      return;
    }
    if (!isValidPhone(form.phone)) {
      setFormError('Enter a valid phone number (10–15 digits)');
      return;
    }
    if (!isEdit && !form.password.trim()) {
      setFormError('Password is required for new employees');
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      const payload: { name: string; email: string; phone: string; password?: string } = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      };
      if (form.password.trim()) {
        payload.password = form.password;
      }
      await onSubmit(payload);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit employee' : 'Add employee'}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          {formError && (
            <Alert severity="error" onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}
          <TextField
            label="Name"
            fullWidth
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            disabled={isEdit}
            helperText={isEdit ? 'Email cannot be changed' : undefined}
          />
          <TextField
            label="Phone"
            fullWidth
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="e.g. 03001234567 or +92 300 1234567"
            error={!!form.phone && !isValidPhone(form.phone)}
            helperText={
              form.phone && !isValidPhone(form.phone)
                ? 'Enter a valid phone number (10–15 digits)'
                : undefined
            }
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder={isEdit ? 'Leave blank to keep current' : undefined}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          variant="contained"
          startIcon={saving ? <CircularProgress size={18} /> : undefined}
        >
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import type { BankProps } from './bank-table-row';

// ----------------------------------------------------------------------

type BankFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BankProps) => void | Promise<void>;
  bank?: BankProps | null;
};

export function BankFormDialog({ open, onClose, onSubmit, bank }: BankFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
  });

  useEffect(() => {
    if (bank) {
      setFormData({
        name: bank.name,
        code: bank.code,
        email: bank.email,
        phone: bank.phone,
        address: bank.address,
        status: bank.status,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
      });
    }
  }, [bank, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const bankData: BankProps = {
      _id: bank?._id || String(Date.now()),
      id: bank?.id || String(Date.now()),
      name: formData.name,
      code: formData.code,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      status: formData.status,
      totalBorrowers: bank?.totalBorrowers || 0,
      totalLoans: bank?.totalLoans || 0,
      totalAmount: bank?.totalAmount || 0,
    };
    await onSubmit(bankData);
    // Don't close here - let parent handle it after success
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{bank ? 'Edit Bank' : 'Add New Bank'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Bank Code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  placeholder="NMB001"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+92 300 1234567"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {bank ? 'Update Bank' : 'Add Bank'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import bankService from 'src/redux/services/bank.services';

import type { BankProps } from './bank-table-row';

// ----------------------------------------------------------------------

type BankStatusDialogProps = {
  open: boolean;
  onClose: () => void;
  onUpdate: (status: string) => void | Promise<void>;
  bank: BankProps | null;
};

export function BankStatusDialog({ open, onClose, onUpdate, bank }: BankStatusDialogProps) {
  const [status, setStatus] = useState(bank?.status || 'active');
  const [loading, setLoading] = useState(false);

  // Update status when bank changes
  useEffect(() => {
    if (bank) {
      setStatus(bank.status || 'active');
    }
  }, [bank]);

  const handleUpdate = async () => {
    if (!bank) return;

    try {
      setLoading(true);
      const response = await bankService.changeBankStatus(bank._id, status);
      if (response.status === 200) {
        setLoading(false);
        onUpdate(status);
        onClose();
        toast.success('Bank status updated successfully');
      }
    } catch (err: any) {
      setLoading(false);
      console.log(err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update bank status');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Bank Status</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Update the status for <strong>{bank?.name}</strong>
        </Typography>

        <TextField
          fullWidth
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ mt: 2 }}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="suspended">Block</MenuItem>
        </TextField>

        {status === 'active' && (
          <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
            Bank will have full access to the system
          </Typography>
        )}
        {status === 'inactive' && (
          <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
            Bank will be disabled and cannot access the system
          </Typography>
        )}
        {status === 'pending' && (
          <Typography variant="caption" color="info.main" sx={{ mt: 1, display: 'block' }}>
            Bank registration is pending approval
          </Typography>
        )}
        {status === 'suspended' && (
          <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
            Bank access is temporarily suspended
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={loading || status === bank?.status}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

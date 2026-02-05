import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';

import type { BankProps } from './bank-table-row';

// ----------------------------------------------------------------------

type BankViewDialogProps = {
  open: boolean;
  onClose: () => void;
  bank: BankProps | null;
  onEdit: () => void;
};

export function BankViewDialog({ open, onClose, bank, onEdit }: BankViewDialogProps) {
  if (!bank) return null;

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Bank Details</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Bank Name
            </Typography>
            <Typography variant="body1">{bank.name}</Typography>
          </Box>

          <Divider />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Bank Code
              </Typography>
              <Typography variant="body1">{bank.code}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Status
              </Typography>
              <Label
                color={
                  (bank.status === 'active' && 'success') ||
                  (bank.status === 'pending' && 'warning') ||
                  (bank.status === 'inactive' && 'error') ||
                  'default'
                }
              >
                {bank.status}
              </Label>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Email
              </Typography>
              <Typography variant="body1">{bank.email}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Phone
              </Typography>
              <Typography variant="body1">{bank.phone}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Address
              </Typography>
              <Typography variant="body1">{bank.address}</Typography>
            </Grid>
          </Grid>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Statistics
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Total Borrowers
                </Typography>
                <Typography variant="h6">{bank.totalBorrowers.toLocaleString()}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Total Loans
                </Typography>
                <Typography variant="h6">{bank.totalLoans.toLocaleString()}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Total Amount
                </Typography>
                <Typography variant="h6">{fCurrency(bank.totalAmount)}</Typography>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleEdit} variant="contained">
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import type { BankProps } from './bank-table-row';

// ----------------------------------------------------------------------

type BankDeleteDialogProps = {
  open: boolean;
  onClose: () => void;
  onDelete: () => void | Promise<void>;
  bank: BankProps | null;
};

export function BankDeleteDialog({ open, onClose, onDelete, bank }: BankDeleteDialogProps) {
  const handleDelete = async () => {
    await onDelete();
    // Don't close here - let parent handle it after success
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Bank</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{bank?.name}</strong>? This action cannot be
          undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleDelete} variant="contained" color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

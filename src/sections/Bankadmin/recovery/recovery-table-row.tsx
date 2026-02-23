import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

export type RecoveryProps = {
  id: string;
  borrowerId: string;
  borrowerName: string;
  cnic: string;
  phone: string;
  email: string;
  loanId: string;
  loanAmount: number;
  dueAmount: number;
  daysLate: number;
  dueDate: string;
  lastPaymentDate: string;
  status: 'overdue' | 'recovered' | 'defaulted';
  isDefaulter: boolean;
};

type RecoveryTableRowProps = {
  row: RecoveryProps;
  selected: boolean;
  // onSelectRow: () => void;
  onMarkDefaulter: (id: string) => void;
};

export function RecoveryTableRow({
  row,
  selected,

  onMarkDefaulter,
}: RecoveryTableRowProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMarkDefaulter = useCallback(async () => {
    setIsProcessing(true);
    await onMarkDefaulter(row.id);
    setIsProcessing(false);
  }, [row.id, onMarkDefaulter]);

  const getDaysLateColor = (days: number) => {
    if (days >= 90) return 'error.main';
    if (days >= 60) return 'warning.main';
    if (days >= 30) return 'info.main';
    return 'grey.600';
  };

  return (
    <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
      {/* <TableCell padding="checkbox">
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell> */}

      <TableCell component="th" scope="row">
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">{row.borrowerName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.borrowerId} • {row.cnic}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Stack spacing={0.5}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {fCurrency(row.dueAmount)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Loan: {fCurrency(row.loanAmount)}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{fDate(row.dueDate)}</Typography>
      </TableCell>
      <TableCell align="center">
        <Typography
          variant="subtitle2"
          sx={{
            color: getDaysLateColor(row.daysLate),
            fontWeight: 600,
          }}
        >
          {row.daysLate} days
        </Typography>
      </TableCell>

      <TableCell align="right">
        {row.isDefaulter ? (
          <Label color="error">DEFAULTER</Label>
        ) : (
          <Button
            size="small"
            variant="contained"
            onClick={handleMarkDefaulter}
            disabled={isProcessing}
            sx={{
              bgcolor: 'grey.800',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.main',
              },
            }}
          >
            Mark Defaulter
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

import type { CreditProposalReport, CreditProposalReportStatus } from 'src/types/assessment.types';

import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';

type CreditProposalReportTableRowProps = {
  row: CreditProposalReport;
  selected: boolean;
  // onSelectRow: () => void;
  onView: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export function CreditProposalReportTableRow({
  row,
  selected,
  
  onView,
  onApprove,
  onReject,
}: CreditProposalReportTableRowProps) {
  const [processing, setProcessing] = useState(false);
  const isPending = row.status === 'pending';

  const handleApprove = useCallback(async () => {
    setProcessing(true);
    await onApprove(row._id);
    setProcessing(false);
  }, [row._id, onApprove]);

  const handleReject = useCallback(async () => {
    setProcessing(true);
    await onReject(row._id);
    setProcessing(false);
  }, [row._id, onReject]);

  const getStatusColor = (status: CreditProposalReportStatus) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
      {/* <TableCell padding="checkbox">
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell> */}
      <TableCell component="th" scope="row">
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">{row.customer?.name ?? '-'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.customer?.email}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell align="center">
        <Typography variant="subtitle2" fontWeight={600}>
          {row.score} / {row.totalScore}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{fCurrency(row.loanAmount)}</Typography>
        {row.loanType && (
          <Typography variant="caption" color="text.secondary" display="block">
            {row.loanType}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body2">{fDate(row.submittedAt)}</Typography>
      </TableCell>
      {/* <TableCell>
        <Label color={getStatusColor(row.status)}>{row.status}</Label>
      </TableCell> */}
      <TableCell align="right">
        <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
          {/* <Button size="small" variant="outlined" onClick={() => onView(row._id)}>
            View
          </Button> */}
          {/* {isPending && (
            <>
              <Button
                size="small"
                variant="contained"
                onClick={handleApprove}
                disabled={processing}
                sx={{ bgcolor: 'grey.800', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleReject}
                disabled={processing}
              >
                Reject
              </Button>
            </>
          )} */}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

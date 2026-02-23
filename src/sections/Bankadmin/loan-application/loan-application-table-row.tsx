import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

export type LoanApplicationProps = {
  id: string;
  applicantName: string;
  applicantId?: string;
  cnic: string;
  phone: string;
  email: string;
  amount: number;
  loanType?: string;
  score: number;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'submitted';
  appliedDate: string;
  reviewedBy: string | null;
  reviewedDate: string | null;
};

type LoanApplicationTableRowProps = {
  row: LoanApplicationProps;
  selected: boolean;
  // onSelectRow: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export function LoanApplicationTableRow({
  row,
  selected,

  onApprove,
  onReject,
}: LoanApplicationTableRowProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = useCallback(async () => {
    setIsProcessing(true);
    await onApprove(row.id);
    setIsProcessing(false);
  }, [row.id, onApprove]);

  const handleReject = useCallback(async () => {
    setIsProcessing(true);
    await onReject(row.id);
    setIsProcessing(false);
  }, [row.id, onReject]);

  const handleViewDetails = useCallback(() => {
    router.push(`/loan-applications/${row.id}`);
  }, [row.id, router]);

  const getStatusColor = () => {
    switch (row.status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'under_review':
        return 'warning';
      case 'pending':
      case 'submitted':
        return 'info';
      default:
        return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'info.main';
    if (score >= 40) return 'warning.main';
    return 'error.main';
  };

  const isPending =
    row.status === 'pending' || row.status === 'under_review' || row.status === 'submitted';

  return (
    <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
      {/* <TableCell padding="checkbox">
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell> */}

      <TableCell component="th" scope="row">
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">{row.applicantName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.id} • {row.cnic}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{fCurrency(row.amount)}</Typography>
        {row.loanType && (
          <Typography variant="caption" color="text.secondary">
            {row.loanType}
          </Typography>
        )}
      </TableCell>

      <TableCell align="center">
        {row.score > 0 ? (
          <Typography
            variant="subtitle2"
            sx={{
              color: getScoreColor(row.score),
              fontWeight: 600,
            }}
          >
            {row.score}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            N/A
          </Typography>
        )}
      </TableCell>

      <TableCell>
        <Label color={getStatusColor()}>{row.status.toUpperCase().replace('_', ' ')}</Label>
      </TableCell>

      <TableCell align="right">
        {isPending ? (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              variant="outlined"
              onClick={handleViewDetails}
              sx={{
                color: 'grey.800',
                borderColor: 'grey.500',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: 'primary.lighter',
                },
              }}
            >
              View
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleApprove}
              disabled={isProcessing}
              sx={{
                bgcolor: 'grey.800',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.main',
                },
              }}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handleReject}
              disabled={isProcessing}
              sx={{
                borderColor: 'grey.500',
                color: 'grey.800',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: 'primary.lighter',
                },
              }}
            >
              Reject
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              variant="outlined"
              onClick={handleViewDetails}
              sx={{
                color: 'grey.800',
                borderColor: 'grey.500',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: 'primary.lighter',
                },
              }}
            >
              View
            </Button>
            <Typography variant="caption" color="text.secondary">
              {row.status === 'approved' ? 'Approved' : 'Rejected'}
            </Typography>
          </Stack>
        )}
      </TableCell>
    </TableRow>
  );
}

import type { Installment } from 'src/_mock/_installment';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

type InstallmentTableRowProps = {
  row: Installment;
  selected: boolean;
  onSelectRow: () => void;
};

export function InstallmentTableRow({ row, selected, onSelectRow }: InstallmentTableRowProps) {
  return (
    <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell>

      <TableCell>
        <Box display="flex" alignItems="center">
          <Typography variant="subtitle2">{row.month}</Typography>
        </Box>
      </TableCell>

      <TableCell>{fCurrency(row.amount)}</TableCell>

      <TableCell>
        <Label
          color={
            (row.status === 'paid' && 'success') || (row.status === 'due' && 'error') || 'default'
          }
        >
          {row.status === 'paid' && 'Paid'}
          {row.status === 'due' && 'Due'}
          {row.status === 'upcoming' && 'Upcoming'}
        </Label>
      </TableCell>

      <TableCell align="right">
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {row.dueDate ? fDate(row.dueDate) : 'N/A'}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

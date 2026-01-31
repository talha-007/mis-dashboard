import type { CreditRating } from 'src/_mock/_credit-rating';

import { useState } from 'react';

import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type CreditRatingTableRowProps = {
  row: CreditRating;
  selected: boolean;
  onSelectRow: () => void;
};

export function CreditRatingTableRow({ row, selected, onSelectRow }: CreditRatingTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High Risk':
        return 'error';
      case 'Moderate Risk':
        return 'warning';
      case 'Low Risk':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'under_review':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell>{row.borrowerName}</TableCell>
        <TableCell>{row.borrowerId}</TableCell>
        <TableCell align="right">
          ${row.loanAmount.toLocaleString()}
        </TableCell>
        <TableCell align="center">{row.creditScore}</TableCell>
        <TableCell>
          <Label color={getRiskColor(row.riskCategory)}>{row.riskCategory}</Label>
        </TableCell>
        <TableCell>{row.lastAssessment}</TableCell>
        <TableCell>
          <Label color={getStatusColor(row.status)}>
            {row.status.replace('_', ' ')}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleClosePopover}>
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>

          <MenuItem onClick={handleClosePopover}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}

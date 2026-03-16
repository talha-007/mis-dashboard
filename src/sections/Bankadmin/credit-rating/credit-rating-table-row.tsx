import type { CreditRating } from 'src/_mock/_credit-rating';

import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { useRouter } from 'src/routes/hooks';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type CreditRatingTableRowProps = {
  row: CreditRating;
  selected: boolean;
  onSelectRow: () => void;
};

export function CreditRatingTableRow({ row, selected, onSelectRow }: CreditRatingTableRowProps) {
  const router = useRouter();
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleViewBorrower = () => {
    handleClosePopover();
    const borrowerId = row.borrower_id ;
    if (borrowerId) {
      router.push(`/borrower-management/view/${borrowerId}`);
    }
  };

  const getRiskColor = (_risk: string) => 'primary' as const;

  const getStatusColor = (_status: string) => 'primary' as const;

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell> */}

        <TableCell>{row.borrowerName}</TableCell>
        <TableCell>{row.borrowerId}</TableCell>
        <TableCell align="right">Rs{row.loanAmount.toLocaleString()}</TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
            <span>{row.creditScore}</span>
            {row.riskGrade && (
              <Label color={getRiskColor(row.riskCategory)} sx={{ minWidth: 24 }}>
                {row.riskGrade}
              </Label>
            )}
          </Stack>
        </TableCell>
        <TableCell>
          <Label color={getRiskColor(row.riskCategory)}>{row.riskCategory}</Label>
        </TableCell>
        <TableCell>
          <Label color={getStatusColor(row.status)}>{row.status.replace('_', ' ')}</Label>
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
          <MenuItem onClick={handleViewBorrower}>
            <Iconify icon="solar:eye-bold" />
            View
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

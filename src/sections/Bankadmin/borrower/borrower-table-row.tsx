import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type BorrowerProps = {
  id: string;
  name: string;
  cnic: string;
  phone: string;
  email: string;
  address: string;
  loanAmount: number;
  loanType: string;
  status: 'active' | 'pending' | 'overdue' | 'closed';
  rating: number;
  joinDate: string;
  lastPayment: string | null;
};

type BorrowerTableRowProps = {
  row: BorrowerProps;
  selected: boolean;
  onSelectRow: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function BorrowerTableRow({
  row,
  selected,
  onSelectRow,
  onEdit,
  onDelete,
}: BorrowerTableRowProps) {
  const navigate = useNavigate();
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleEdit = useCallback(() => {
    handleClosePopover();
    navigate(`/borrower-management/edit/${row.id}`);
  }, [row.id, navigate]);

  const handleView = useCallback(() => {
    handleClosePopover();
    navigate(`/borrower-management/view/${row.id}`);
  }, [row.id, navigate]);

  const handleDelete = useCallback(() => {
    handleClosePopover();
    if (onDelete) {
      onDelete(row.id);
    }
  }, [row.id, onDelete]);

  const getStatusColor = () => {
    switch (row.status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };
  console.log(row);
  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell> */}

        <TableCell component="th" scope="row">
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{row.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {row.cnic} 
            </Typography>
            <Typography variant="caption" color="text.secondary">{row.email}</Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="body2">{fCurrency(row.loanAmount)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {row.loanType}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Label color={getStatusColor()}>{row.status.toUpperCase()}</Label>
        </TableCell>

        <TableCell align="center">{row.rating}</TableCell>

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
          <MenuItem onClick={handleView}>
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}

import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type EmployeeProps = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive?: boolean;
  openCases?: number;
};

type EmployeeTableRowProps = {
  row: EmployeeProps;
  selected: boolean;
  onSelectRow: () => void;
  onEdit?: (row: EmployeeProps) => void;
  onDelete?: (id: string) => void;
};

export function EmployeeTableRow({
  row,
  selected,
  onSelectRow,
  onEdit,
  onDelete,
}: EmployeeTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleEdit = useCallback(() => {
    handleClosePopover();
    onEdit?.(row);
  }, [row, onEdit]);

  const handleDelete = useCallback(() => {
    handleClosePopover();
    onDelete?.(row._id);
  }, [row._id, onDelete]);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell component="th" scope="row">
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{row.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{row.phone || '—'}</TableCell>

        <TableCell align="right">{row.openCases ?? 0}</TableCell>

        <TableCell>
          <Label color={row.isActive !== false ? 'success' : 'default'}>
            {row.isActive !== false ? 'Active' : 'Inactive'}
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

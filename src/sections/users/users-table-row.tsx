import { useState } from 'react';

import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

interface UsersTableRowProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  onViewRow?: (id: string) => void;
  onEditRow: (id: string) => void;
  onDeleteRow: (id: string) => void;
}

export function UsersTableRow({
  id,
  firstName,
  lastName,
  email,
  phone,
  role,
  onViewRow,
  onEditRow,
  onDeleteRow,
}: UsersTableRowProps) {
  const [open, setOpen] = useState<HTMLButtonElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleEdit = () => {
    onEditRow(id);
    handleCloseMenu();
  };

  const handleView = () => {
    if (onViewRow) {
      onViewRow(id);
    }
    handleCloseMenu();
  };

  const handleDelete = () => {
    onDeleteRow(id);
    handleCloseMenu();
  };

  const getRoleColor = (roleVal: string) => {
    const roleColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      staff: 'default',
      manager: 'primary',
      supervisor: 'secondary',
    };
    return roleColors[roleVal] || 'default';
  };

  const getStatusColor = (statusVal: string) => statusVal === 'active' ? 'success' : 'error';

  return (
    <>
      <TableRow hover tabIndex={-1}>
        <TableCell>{firstName}</TableCell>
        <TableCell>{lastName}</TableCell>
        <TableCell>{email}</TableCell>
        <TableCell>{phone}</TableCell>
        <TableCell>
          <Chip label={role} color={getRoleColor(role)} size="small" />
        </TableCell>
        
        <TableCell align="right">
          <IconButton size="small" color="inherit" onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleView} sx={{ color: 'primary.main' }}>
          <Iconify icon="eva:eye-fill" sx={{ mr: 2 }} />
          View
        </MenuItem>
        <MenuItem onClick={handleEdit} sx={{ color: 'info.main' }}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}

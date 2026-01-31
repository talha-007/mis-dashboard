import type { Report } from 'src/_mock/_report';

import { useState } from 'react';

import Chip from '@mui/material/Chip';
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

type ReportTableRowProps = {
  row: Report;
  selected: boolean;
  onSelectRow: () => void;
};

export function ReportTableRow({ row, selected, onSelectRow }: ReportTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'portfolio':
        return 'primary';
      case 'recovery':
        return 'success';
      case 'credit':
        return 'warning';
      case 'compliance':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'portfolio':
        return 'Portfolio';
      case 'recovery':
        return 'Recovery';
      case 'credit':
        return 'Credit';
      case 'compliance':
        return 'Compliance';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'success';
      case 'generating':
        return 'warning';
      case 'failed':
        return 'error';
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

        <TableCell>
          {row.name}
          <br />
          <span style={{ fontSize: '0.75rem', color: 'text.secondary' }}>{row.description}</span>
        </TableCell>
        <TableCell>
          <Label color={getTypeColor(row.type)}>{getTypeLabel(row.type)}</Label>
        </TableCell>
        <TableCell>{row.lastGenerated}</TableCell>
        <TableCell>{row.generatedBy}</TableCell>
        <TableCell>
          <Label color={getStatusColor(row.status)}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </Label>
        </TableCell>
        <TableCell>{row.fileSize || 'N/A'}</TableCell>
        <TableCell>
          <Chip label={row.format} size="small" variant="outlined" />
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
            width: 160,
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
            <Iconify icon="solar:download-bold" />
            Download
          </MenuItem>

          <MenuItem onClick={handleClosePopover}>
            <Iconify icon="solar:refresh-bold" />
            Regenerate
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

import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface UsersTableToolbarProps {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReload?: () => void;
}

export function UsersTableToolbar({
  filterName,
  onFilterName,
  onReload,
}: UsersTableToolbarProps) {
  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ p: 2.5, pr: 1 }} alignItems="center">
      <TextField
        fullWidth
        size="small"
        placeholder="Search user..."
        value={filterName}
        onChange={onFilterName}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: { sm: 'unset' } }}
      />
      {onReload && (
        <Tooltip title="Reload">
          <IconButton onClick={onReload} size="small">
            <Iconify icon="solar:refresh-bold" width={20} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

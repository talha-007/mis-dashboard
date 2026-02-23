import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface UsersTableToolbarProps {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UsersTableToolbar({ filterName, onFilterName }: UsersTableToolbarProps) {
  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ p: 2.5, pr: 1 }}>
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
    </Stack>
  );
}

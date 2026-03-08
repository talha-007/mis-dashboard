import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type RecoveryTableToolbarProps = {
  numSelected: number;
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReload?: () => void;
};

export function RecoveryTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  onReload,
}: RecoveryTableToolbarProps) {
  return (
    <Toolbar
      sx={{
        height: 96,
        display: 'flex',
        justifyContent: 'space-between',
        p: (theme) => theme.spacing(0, 1, 0, 3),
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <OutlinedInput
          fullWidth
          value={filterName}
          onChange={onFilterName}
          placeholder="Search borrower..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ maxWidth: 320 }}
        />
      )}

      {onReload && (
        <Tooltip title="Reload">
          <IconButton onClick={onReload} size="small">
            <Iconify icon="solar:refresh-bold" width={20} />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

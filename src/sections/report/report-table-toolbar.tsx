import type { SelectChangeEvent } from '@mui/material/Select';

import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type ReportTableToolbarProps = {
  numSelected: number;
  filterName: string;
  filterType: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterType: (event: SelectChangeEvent) => void;
};

export function ReportTableToolbar({
  numSelected,
  filterName,
  filterType,
  onFilterName,
  onFilterType,
}: ReportTableToolbarProps) {
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
          placeholder="Search reports..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ maxWidth: 320 }}
        />
      )}

      {numSelected > 0 ? (
        <Tooltip title="Download Selected">
          <IconButton>
            <Iconify icon="solar:download-bold" />
          </IconButton>
        </Tooltip>
      ) : (
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Report Type</InputLabel>
          <Select value={filterType} onChange={onFilterType} label="Report Type" size="small">
            <MenuItem value="all">All Reports</MenuItem>
            <MenuItem value="portfolio">Portfolio Reports</MenuItem>
            <MenuItem value="recovery">Recovery Reports</MenuItem>
            <MenuItem value="credit">Credit Reports</MenuItem>
            <MenuItem value="compliance">Compliance Reports</MenuItem>
          </Select>
        </FormControl>
      )}
    </Toolbar>
  );
}

import type { StackProps } from '@mui/material/Stack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function NavUpgrade({ sx, ...other }: StackProps) {
  return (
    <Box
      sx={[
        {
          mb: 4,
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Typography
        variant="h6"
        sx={[
          (theme) => ({
            background: `linear-gradient(to right, ${theme.vars.palette.secondary.main}, ${theme.vars.palette.warning.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            color: 'transparent',
          }),
        ]}
      >
        MIS Dashboard
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
        Management Information System
      </Typography>

      <Box
        component="img"
        alt="MIS dashboard"
        src="/assets/illustrations/illustration-dashboard.webp"
        sx={{ width: 200, my: 2 }}
      />
    </Box>
  );
}

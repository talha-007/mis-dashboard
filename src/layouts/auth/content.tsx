import type { BoxProps } from '@mui/material/Box';

import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';

import { layoutClasses } from '../core/classes';

// ----------------------------------------------------------------------

export type AuthContentProps = BoxProps;

export function AuthContent({ sx, children, className, ...other }: AuthContentProps) {
  return (
    <Box
      className={mergeClasses([layoutClasses.content, className])}
      sx={[
        (theme) => ({
          width: 1,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 'var(--layout-auth-content-width)',
          // Padding and background only for non-card layouts (sign-in, forgot-password, etc)
          '& > :not(.MuiCard-root)': {
            py: 5,
            px: 3,
            borderRadius: 2,
            bgcolor: theme.vars.palette.background.default,
            maxWidth: 420,
            width: 1,
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </Box>
  );
}

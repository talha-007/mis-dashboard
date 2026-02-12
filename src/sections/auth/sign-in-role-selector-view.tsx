/**
 * Sign In Role Selector View
 * Landing page for selecting user role before login
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface RoleCard {
  role: 'superadmin' | 'admin' | 'customer';
  title: string;
  description: string;
  icon: string;
  color: string;
  path: string;
}

// Only show customer login publicly for security
// Admin and SuperAdmin can access their login pages by typing the URL directly
const ROLES: RoleCard[] = [
  {
    role: 'customer',
    title: 'Customer',
    description: 'Access your account and loans',
    icon: 'solar:user-bold-duotone',
    color: '#4D0CE7', // Use brand primary color (purple)
    path: '/sign-in/customer',
  },
];

export function SignInRoleSelectorView() {
  const router = useRouter();

  return (
    <Stack spacing={4}>
      {/* Header */}
      <Stack spacing={1.5} alignItems="center" textAlign="center">
        <Typography variant="h4" fontWeight={700}>
          Welcome to MIS Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={400}>
          Sign in to access your account
        </Typography>
      </Stack>

      {/* Role Cards */}
      <Stack spacing={2}>
        {ROLES.map((roleCard) => (
          <Card
            key={roleCard.role}
            sx={{
              p: 0,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid',
              borderColor: 'divider',
              '&:hover': {
                borderColor: roleCard.color,
                transform: 'translateY(-4px)',
                boxShadow: (theme) => `0 8px 24px ${alpha(roleCard.color, 0.24)}`,
              },
            }}
            onClick={() => router.push(roleCard.path)}
          >
            <Button
              fullWidth
              sx={{
                p: 3,
                display: 'flex',
                justifyContent: 'flex-start',
                textAlign: 'left',
                textTransform: 'none',
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'transparent',
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" width="100%">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(roleCard.color, 0.08),
                    color: roleCard.color,
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon={roleCard.icon} width={32} />
                </Box>

                <Stack spacing={0.5} flex={1}>
                  <Typography variant="h6" fontWeight={600}>
                    {roleCard.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {roleCard.description}
                  </Typography>
                </Stack>

                <Iconify
                  icon="eva:arrow-ios-forward-fill"
                  width={24}
                  sx={{ color: 'text.disabled' }}
                />
              </Stack>
            </Button>
          </Card>
        ))}
      </Stack>

      {/* Footer */}
      <Box textAlign="center" pt={2}>
        <Typography variant="body2" color="text.secondary">
          Need help? Contact support at{' '}
          <Typography
            component="span"
            variant="body2"
            fontWeight={600}
            color="primary.main"
            sx={{ cursor: 'pointer' }}
          >
            support@mis.local
          </Typography>
        </Typography>
      </Box>
    </Stack>
  );
}

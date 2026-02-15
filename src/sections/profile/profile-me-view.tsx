import type { MeProfileResponse } from 'src/types/me.types';

import { useState, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import authService from 'src/redux/services/auth.services';

import { Iconify } from 'src/components/iconify';

import { UserRole } from 'src/types/auth.types';
import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

function formatDate(value: string | undefined): string {
  if (!value) return '—';
  try {
    const formatted = fDateTime(value);
    return formatted === 'Invalid date' ? '—' : formatted;
  } catch {
    return '—';
  }
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ py: 1.25 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={22} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value ?? '—'}
        </Typography>
      </Box>
    </Stack>
  );
}

function SectionCard({
  title,
  icon,
  children,
  sx,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  sx?: object;
}) {
  return (
    <Card
      sx={{
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: (theme) => `0 0 0 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        ...sx,
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: (theme) =>
            `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
            color: 'primary.main',
          }}
        >
          <Iconify icon={icon} width={24} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

function getRoleLabel(role: string) {
  const r = (role ?? '').toLowerCase();
  if (r === UserRole.SUPER_ADMIN) return 'Super Admin';
  if (r === UserRole.ADMIN) return 'Admin';
  if (r === UserRole.CUSTOMER) return 'Customer';
  return role || '—';
}

function getRoleColor(
  role: string
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  const r = (role ?? '').toLowerCase();
  if (r === UserRole.SUPER_ADMIN) return 'error';
  if (r === UserRole.ADMIN) return 'primary';
  if (r === UserRole.CUSTOMER) return 'success';
  return 'default';
}

// ----------------------------------------------------------------------

export function ProfileMeView() {
  const [profile, setProfile] = useState<MeProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    authService
      .getProfile()
      .then((data) => {
        if (!cancelled) {
          setProfile(data ?? null);
          if (data === null && !cancelled) setError('Failed to load profile');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load profile');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </DashboardContent>
    );
  }

  if (error || !profile) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error ?? 'Profile not available'}
          </Alert>
        </Container>
      </DashboardContent>
    );
  }

  const { user, bank, subscription } = profile;
  const role = (user?.role ?? '').toLowerCase();
  const isAdmin = role === UserRole.ADMIN;
  const isSuperAdmin = role === UserRole.SUPER_ADMIN;
  const isCustomer = role === UserRole.CUSTOMER;
  const displayName =
    user?.name ??
    ([user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email) ??
    '—';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Hero card */}
          <Card
            sx={{
              overflow: 'hidden',
              borderRadius: 2,
              background: (theme) =>
                `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.12)} 0%, ${varAlpha(theme.vars.palette.primary.darkChannel, 0.06)} 100%)`,
              boxShadow: (theme) =>
                `0 0 0 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'center', sm: 'flex-end' }}
              spacing={3}
              sx={{ p: 4 }}
            >
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  border: (theme) => `4px solid ${theme.vars.palette.background.paper}`,
                  boxShadow: (theme) => theme.customShadows.z8,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {initial}
              </Avatar>
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {displayName}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                  {user?.email ?? '—'}
                </Typography>
                <Chip
                  label={getRoleLabel(user?.role ?? '')}
                  color={getRoleColor(user?.role ?? '')}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Stack>
          </Card>

          {/* User details */}
          <SectionCard title="Account" icon="solar:user-id-bold-duotone">
            <Stack spacing={0}>
              <InfoRow icon="solar:user-bold-duotone" label="Full name" value={displayName} />
              <InfoRow icon="solar:letter-bold-duotone" label="Email" value={user?.email} />
              <InfoRow
                icon="solar:medal-ribbons-star-bold-duotone"
                label="Role"
                value={getRoleLabel(user?.role ?? '')}
              />
              <InfoRow
                icon="solar:calendar-bold-duotone"
                label="Member since"
                value={formatDate(user?.createdAt)}
              />
              <InfoRow
                icon="solar:clock-circle-bold-duotone"
                label="Last updated"
                value={formatDate(user?.updatedAt)}
              />
            </Stack>
          </SectionCard>

          {/* Bank (admin only) */}
          {isAdmin && bank && (
            <SectionCard title="Bank" icon="solar:building-2-bold-duotone">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoRow
                    icon="solar:building-2-bold-duotone"
                    label="Bank name"
                    value={bank.name}
                  />
                  <InfoRow icon="solar:link-bold-duotone" label="Slug" value={bank.slug} />
                  <InfoRow icon="solar:document-text-bold-duotone" label="Code" value={bank.code} />
                  <InfoRow
                    icon="solar:letter-bold-duotone"
                    label="Admin email"
                    value={bank.adminEmail}
                  />
                  <InfoRow icon="solar:phone-bold-duotone" label="Phone" value={bank.phone} />
                  <InfoRow
                    icon="solar:map-point-bold-duotone"
                    label="Address"
                    value={bank.address}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoRow
                    icon="solar:map-bold-duotone"
                    label="City, State, Country"
                    value={[bank.city, bank.state, bank.country].filter(Boolean).join(', ') || '—'}
                  />
                  <InfoRow
                    icon="solar:wallet-money-bold-duotone"
                    label="Capital amount"
                    value={bank.capitalAmount}
                  />
                  <InfoRow
                    icon="solar:calendar-bold-duotone"
                    label="Established"
                    value={formatDate(bank.establishedDate)}
                  />
                  <InfoRow icon="solar:verify-bold-duotone" label="Status" value={bank.status} />
                  <InfoRow
                    icon="solar:card-bold-duotone"
                    label="Subscription status"
                    value={bank.subscriptionStatus}
                  />
                </Grid>
              </Grid>
            </SectionCard>
          )}

          {/* Subscription (admin only) */}
          {isAdmin && subscription && (
            <SectionCard title="Subscription" icon="solar:card-bold-duotone">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoRow
                    icon="solar:verify-bold-duotone"
                    label="Status"
                    value={
                      <Chip
                        label={subscription.status ?? '—'}
                        color={subscription.status === 'active' ? 'success' : 'default'}
                        size="small"
                        variant="filled"
                      />
                    }
                  />
                  <InfoRow
                    icon="solar:wallet-money-bold-duotone"
                    label="Amount"
                    value={subscription.amount != null ? `$${subscription.amount}` : '—'}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoRow
                    icon="solar:calendar-bold-duotone"
                    label="Date paid"
                    value={formatDate(subscription.datePaid)}
                  />
                  <InfoRow
                    icon="solar:clock-circle-bold-duotone"
                    label="Next payment"
                    value={formatDate(subscription.nextPayDate)}
                  />
                </Grid>
              </Grid>
            </SectionCard>
          )}

          {/* Super admin note */}
          {isSuperAdmin && (
            <Card
              sx={{
                borderRadius: 2,
                p: 3,
                bgcolor: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.08),
                border: (theme) =>
                  `1px solid ${varAlpha(theme.vars.palette.info.mainChannel, 0.2)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Iconify
                  icon="solar:info-circle-bold-duotone"
                  width={28}
                  sx={{ color: 'info.main' }}
                />
                <Typography variant="body2" color="text.secondary">
                  Super admin account — no bank or subscription is associated.
                </Typography>
              </Stack>
            </Card>
          )}

          {/* Customer placeholder */}
          {isCustomer && (
            <SectionCard title="More details" icon="solar:user-id-bold-duotone">
              <Typography variant="body2" color="text.secondary">
                Customer-specific details will be shown here later.
              </Typography>
            </SectionCard>
          )}
        </Stack>
      </Container>
    </DashboardContent>
  );
}

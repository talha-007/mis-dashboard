/**
 * Bank Details View
 * Full-page view of a single bank with all details in a readable layout.
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import { varAlpha } from 'minimal-shared/utils';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

import { fCurrency } from 'src/utils/format-number';
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) {
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
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      sx={{
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: (theme) =>
          `0 0 0 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
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

export type BankDetailsData = {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  code?: string;
  adminEmail?: string;
  phone?: string;
  capitalAmount?: string | number;
  establishedDate?: string;
  fax?: string;
  email?: string;
  state?: string;
  status?: string;
  subscriptionStatus?: string;
  address?: string;
  city?: string;
  country?: string;
  isGoogleLogin?: boolean;
  userId?: string;
  subscriptionDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BankDetailsResponse = {
  bank: BankDetailsData;
};

type BankDetailsViewProps = {
  bank: BankDetailsResponse | null;
  loading?: boolean;
  onEdit?: () => void;
};

export function BankDetailsView({ bank, loading, onEdit }: BankDetailsViewProps) {
  const router = useRouter();
  
  if (loading) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Skeleton variant="rounded" height={56} width={200} />
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} />
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </DashboardContent>
    );
  }

  if (!bank?.bank) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Typography color="text.secondary">Bank not found.</Typography>
          <Button sx={{ mt: 2 }} onClick={() => router.push('/bank-management')}>
            Back to Bank Management
          </Button>
        </Container>
      </DashboardContent>
    );
  }

  const b = bank.bank;

  const statusColor =
    b.status === 'active'
      ? 'success'
      : b.status === 'pending'
        ? 'warning'
        : b.status === 'inactive'
          ? 'error'
          : 'default';
  const subColor =
    b.subscriptionStatus === 'active' ? 'success' : b.subscriptionStatus === 'expired' ? 'error' : 'default';

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Header */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button
                startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                onClick={() => router.push('/bank-management')}
                color="inherit"
                variant="text"
              >
                Back
              </Button>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {b.name ?? 'Bank Details'}
              </Typography>
            </Stack>
            {onEdit && (
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:pen-bold" />}
                onClick={onEdit}
              >
                Edit Bank
              </Button>
            )}
          </Stack>

          {/* Basic info */}
          <SectionCard title="Basic Information" icon="wpf:name">
            <Grid container spacing={0}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow icon="wpf:name" label="Bank Name" value={b.name} />
                <InfoRow icon="solar:link-bold-duotone" label="Slug" value={b.slug} />
                <InfoRow icon="solar:document-text-bold-duotone" label="Code" value={b.code} />
                <InfoRow
                  icon="fluent:status-16-regular"
                  label="Status"
                  value={<Label color={statusColor}>{b.status ?? '—'}</Label>}
                />
                <InfoRow
                  icon="solar:card-bold-duotone"
                  label="Subscription Status"
                  value={<Label color={subColor}>{b.subscriptionStatus ?? '—'}</Label>}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow icon="solar:calendar-bold-duotone" label="Established Date" value={formatDate(b.establishedDate)} />
                <InfoRow icon="solar:calendar-bold-duotone" label="Subscription Date" value={formatDate(b.subscriptionDate)} />
                <InfoRow icon="solar:clock-circle-bold-duotone" label="Created" value={formatDate(b.createdAt)} />
                <InfoRow icon="solar:clock-circle-bold-duotone" label="Last Updated" value={formatDate(b.updatedAt)} />
              </Grid>
            </Grid>
          </SectionCard>

          {/* Contact */}
          <SectionCard title="Contact & Address" icon="solar:letter-bold-duotone">
            <Grid container spacing={0}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow icon="solar:letter-bold-duotone" label="Admin Email" value={b.adminEmail} />
                <InfoRow icon="solar:letter-bold-duotone" label="Bank Email" value={b.email} />
                <InfoRow icon="solar:phone-bold-duotone" label="Phone" value={b.phone} />
                <InfoRow icon="solar:phone-bold-duotone" label="Fax" value={b.fax} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow icon="solar:map-point-bold-duotone" label="Address" value={b.address} />
                <InfoRow
                  icon="solar:map-bold-duotone"
                  label="City, State, Country"
                  value={[b.city, b.state, b.country].filter(Boolean).join(', ') || '—'}
                />
              </Grid>
            </Grid>
          </SectionCard>

          {/* Financial & other */}
          <SectionCard title="Financial & Other" icon="solar:wallet-money-bold-duotone">
            <Grid container spacing={0}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow
                  icon="solar:wallet-money-bold-duotone"
                  label="Capital Amount"
                  value={b.capitalAmount != null ? fCurrency(Number(b.capitalAmount)) : '—'}
                />
                <InfoRow
                  icon="solar:user-id-bold-duotone"
                  label="User ID"
                  value={b.userId}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow
                  icon="solar:shield-user-bold-duotone"
                  label="Google Login"
                  value={b.isGoogleLogin === true ? 'Yes' : b.isGoogleLogin === false ? 'No' : '—'}
                />
              </Grid>
            </Grid>
          </SectionCard>
        </Stack>
      </Container>
    </DashboardContent>
  );
}

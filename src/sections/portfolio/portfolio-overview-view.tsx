/**
 * Portfolio Overview View
 * Displays portfolio statistics and metrics table.
 * For super admin: shows platform stats (banks, subscriptions, revenue, expired).
 */

import type { CardProps } from '@mui/material/Card';

import { toast } from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { useAuth } from 'src/hooks/use-auth';

import { getBankRegisterUrl } from 'src/utils/bank-routes';
import { fNumber, fCurrency } from 'src/utils/format-number';

import { useAppSelector } from 'src/store';
import bankService from 'src/redux/services/bank.services';
import paymentService from 'src/redux/services/payment.services';

import { Iconify } from 'src/components/iconify';

import { BankPaymentDialog } from 'src/sections/Superadmin/bank/payments/bank-payment-dialog';

import { UserRole } from 'src/types/auth.types';

// ----------------------------------------------------------------------

export type SuperAdminStats = {
  totalBanks: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  revenue: number;
};

// ----------------------------------------------------------------------

export function PortfolioOverviewView() {
  const theme = useTheme();
  const { user } = useAuth();
  const { bank } = useAppSelector((state) => state.auth);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [superAdminStats, setSuperAdminStats] = useState<SuperAdminStats | null>(null);
  const [superAdminStatsLoading, setSuperAdminStatsLoading] = useState(false);
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isAdmin = user?.role === UserRole.ADMIN;

  const fetchSuperAdminStats = useCallback(async () => {
    if (!isSuperAdmin) return;
    setSuperAdminStatsLoading(true);
    try {
      const [banksRes, subsRes] = await Promise.all([
        bankService.getBanks({ page: 1, limit: 1 }),
        paymentService.getBankSubscriptions({ page: 1, limit: 500 }),
      ]);
      const pagination = banksRes.data?.pagination ?? banksRes.data;
      const totalBanks =
        (typeof pagination?.total === 'number' && pagination.total) ??
        banksRes.data?.total ??
        (Array.isArray(banksRes.data?.data) ? banksRes.data.data.length : 0) ??
        (Array.isArray(banksRes.data?.banks) ? banksRes.data.banks.length : 0) ??
        0;
      const subsData =
        subsRes.data?.data ??
        subsRes.data?.subscriptions ??
        (Array.isArray(subsRes.data) ? subsRes.data : []);
      const subscriptions = Array.isArray(subsData) ? subsData : [];
      const activeSubscriptions = subscriptions.filter(
        (s: any) => (s.status || '').toLowerCase() === 'active'
      ).length;
      const expiredSubscriptions = subscriptions.filter(
        (s: any) => (s.status || '').toLowerCase() === 'expired'
      ).length;
      const revenue = subscriptions.reduce(
        (sum: number, s: any) => sum + (Number(s.amount) || 0),
        0
      );
      setSuperAdminStats({
        totalBanks,
        activeSubscriptions,
        expiredSubscriptions,
        revenue,
      });
    } catch {
      setSuperAdminStats(null);
    } finally {
      setSuperAdminStatsLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchSuperAdminStats();
  }, [fetchSuperAdminStats]);

  const handlePaymentSuccess = () => {
    setOpenPaymentDialog(false);
    fetchSuperAdminStats();
  };

  const customerRegisterUrl =
    typeof window !== 'undefined' && bank?.slug
      ? `${window.location.origin}${getBankRegisterUrl(bank.slug)}`
      : '';

  const handleCopyRegisterLink = async () => {
    if (!customerRegisterUrl) return;
    try {
      await navigator.clipboard.writeText(customerRegisterUrl);
      toast.success('Registration link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">
          {isSuperAdmin ? 'Platform Overview' : 'Portfolio Overview'}
        </Typography>
        {isSuperAdmin && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:wallet-money-bold" />}
            onClick={() => setOpenPaymentDialog(true)}
            size="small"  
          >
            Record Bank Payment
          </Button>
        )}
      </Box>

      {/* Super Admin: Platform stats (banks, subscriptions, revenue, expired) */}
      {isSuperAdmin && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {superAdminStatsLoading ? (
            [1, 2, 3, 4].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          ) : superAdminStats ? (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Total Banks"
                  value={fNumber(superAdminStats.totalBanks)}
                  icon="solar:building-2-bold-duotone"
                  color="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Active Subscriptions"
                  value={fNumber(superAdminStats.activeSubscriptions)}
                  icon="solar:card-bold-duotone"
                  color="success"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Expired Subscriptions"
                  value={fNumber(superAdminStats.expiredSubscriptions)}
                  icon="solar:clock-circle-bold-duotone"
                  color="error"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Revenue"
                  value={fCurrency(superAdminStats.revenue)}
                  icon="solar:wallet-money-bold-duotone"
                  color="info"
                />
              </Grid>
            </>
          ) : null}
        </Grid>
      )}

      {/* Customer registration link (admin only) */}
      {isAdmin && bank?.slug && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Customer registration link
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                }}
              >
                {customerRegisterUrl}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:copy-bold" />}
              onClick={handleCopyRegisterLink}
            >
              Copy link
            </Button>
          </Stack>
        </Card>
      )}

      {/* Bank Payment Dialog */}
      {isSuperAdmin && (
        <BankPaymentDialog
          open={openPaymentDialog}
          onClose={() => setOpenPaymentDialog(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

type StatCardProps = CardProps & {
  title: string;
  value: string;
  icon: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: number;
  isIncrease?: boolean;
};

function StatCard({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  isIncrease,
  sx,
  ...other
}: StatCardProps) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        boxShadow: theme.customShadows.card,
        height: '100%',
        minHeight: { xs: 100, sm: 120 },
        display: 'flex',
        ...sx,
      }}
      {...other}
    >
      <Stack
        direction={{ xs: 'row', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'center', sm: 'flex-start' }}
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{ flex: 1, minWidth: 0 }}
      >
        <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
          >
            {title}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
              fontWeight: 700,
              lineHeight: 1.2,
              wordBreak: 'break-word',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {value}
          </Typography>

          {trend !== undefined && (
            <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap">
              <Iconify
                icon={isIncrease ? 'eva:trending-up-fill' : 'eva:trending-down-fill'}
                sx={{
                  color: isIncrease ? 'success.main' : 'error.main',
                  width: 18,
                  height: 18,
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: isIncrease ? 'success.main' : 'error.main', fontWeight: 600 }}
              >
                {Math.abs(trend)}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                vs last month
              </Typography>
            </Stack>
          )}
        </Stack>

        <Box
          sx={{
            width: { xs: 48, sm: 56, md: 64 },
            height: { xs: 48, sm: 56, md: 64 },
            flexShrink: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette[color].main, 0.16),
          }}
        >
          <Iconify icon={icon} width={28} sx={{ color: `${color}.main` }} />
        </Box>
      </Stack>
    </Card>
  );
}

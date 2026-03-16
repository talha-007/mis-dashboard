/**
 * Portfolio Overview View
 * Displays portfolio statistics and metrics table.
 * For super admin: shows platform stats (banks, subscriptions, revenue, expired).
 */

import type { CardProps } from '@mui/material/Card';

import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

import { useAuth } from 'src/hooks/use-auth';

import { fDate } from 'src/utils/format-time';
import { getBankRegisterUrl } from 'src/utils/bank-routes';
import { fNumber, fCurrency } from 'src/utils/format-number';

function formatPercent(value: number): string {
  const n = Number(value);
  const pct = n > 0 && n <= 1 ? n * 100 : n;
  return `${Number(pct).toFixed(1)}%`;
}

import { useAppSelector } from 'src/store';
import bankAdminService from 'src/redux/services/bank-admin.services';
import superadminService from 'src/redux/services/superadmin.services';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

import { BankPaymentDialog } from 'src/sections/Superadmin/bank/payments/bank-payment-dialog';

import { UserRole } from 'src/types/auth.types';

// ----------------------------------------------------------------------

export type SuperAdminStats = {
  totalBanks: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
};

export type BankAdminStats = {
  activeBorrowers: number;
  bankCapital: number;
  activeLoans: number;
  auditReadiness: number;
  outstandingPortfolio: number;
  par: number;
  recoveryRate: number;
  recoveryToday: number;
  totalDisbursedMTD: number;
  totalInterestOutstanding: number;
  totalOverdueAmount: number;
  totalPortfolioOutstanding: number;
  totalPrincipalOutstanding: number;
  totalLoanRepayment: number;
  // Legacy / optional
  parCount?: number;
};

type RecentApplication = {
  id: string;
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
  cnic: string;
  city: string;
  region: string;
  durationMonths: number;
  installmentAmount: number;
  fatherName: string;
  customer?: {
    id: string;
    name: string;
    lastname: string;
    email: string;
    phone: string;
  };
};

export type BankAdminAdditionalStats = {
  recentApplications: RecentApplication[];
  highRiskBorrowers: number;
  loansNearDefault: number;
};

export type GraphDataPoint = { date: string; amount: number };
export type DPDBucketItem = { bucket: string; count: number };
export type BranchExposureItem = { branchName: string; exposure: number };

export type BankAdminGraphsData = {
  disbursementTrend?: GraphDataPoint[];
  collectionTrend?: GraphDataPoint[];
  dpdBuckets?: DPDBucketItem[];
  branchExposure?: BranchExposureItem[];
};

// ----------------------------------------------------------------------

export function PortfolioOverviewView() {
  const theme = useTheme();
  const { user } = useAuth();
  const bank = useAppSelector((state: any) => state.auth?.bank);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [superAdminStats, setSuperAdminStats] = useState<SuperAdminStats | null>(null);
  const [bankAdminStats, setBankAdminStats] = useState<BankAdminStats | null>(null);
  const [bankAdminAdditionalStats, setBankAdminAdditionalStats] = useState<BankAdminAdditionalStats | null>(null);
    useState<BankAdminAdditionalStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [additionalStatsLoading, setAdditionalStatsLoading] = useState(false);
  const [graphsData, setGraphsData] = useState<BankAdminGraphsData | null>(null);
  const [graphsLoading, setGraphsLoading] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState<'default' | 'today' | 'weekly' | 'monthly' | 'yearly'>(
    'default'
  );
  const [statsStartDate, setStatsStartDate] = useState<string>(
    dayjs().startOf('month').format('YYYY-MM-DD')
  );
  const [statsEndDate, setStatsEndDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [statsUseCustomRange, setStatsUseCustomRange] = useState(false);
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isAdmin = user?.role === UserRole.ADMIN;

  const fetchSuperAdminStats = useCallback(async () => {
    if (!isSuperAdmin) return;
    setStatsLoading(true);
    try {
      const response = await superadminService.getStats();
      if (response.status === 200) {
        const data = response.data?.data || response.data;
        const stats = data?.stats || {};
        setSuperAdminStats({
          totalBanks: stats.totalBanks || 0,
          activeSubscriptions: stats.activeSubscriptions || 0,
          expiredSubscriptions: stats.expiredSubscriptions || 0,
          totalRevenue: stats.totalRevenue || 0,
        });
      }
    } catch {
      setSuperAdminStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [isSuperAdmin]);

  const fetchBankAdminStats = useCallback(async () => {
    if (!isAdmin) return;
    setStatsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statsUseCustomRange) {
        params.startDate = statsStartDate;
        params.endDate = statsEndDate;
      } else if (statsPeriod !== 'default') {
        params.period = statsPeriod;
      }
      const response = await bankAdminService.getStats(params);
      const data = response.data?.data ?? response.data;
      const stats = data?.stats ?? data ?? {};
      setBankAdminStats({
        activeBorrowers: Number(stats.activeBorrowers ?? 0),
        bankCapital: Number(stats.bankRemainingCapital ?? 0),
        activeLoans: Number(stats.activeLoans ?? 0),
        auditReadiness: Number(stats.auditReadiness ?? 0),
        outstandingPortfolio: Number(stats.outstandingPortfolio ?? 0),
        par: Number(stats.par ?? stats.parCount ?? 0),
        recoveryRate: Number(stats.recoveryRate ?? 0),
        recoveryToday: Number(stats.todayLoanRepayment ?? 0),
        totalDisbursedMTD: Number(stats.totalDisbursedMTD ?? 0),
        totalInterestOutstanding: Number(stats.totalInterestOutstanding ?? 0),
        totalOverdueAmount: Number(stats.totalOverdueAmount ?? 0),
        totalPortfolioOutstanding: Number(stats.totalPortfolioOutstanding ?? 0),
        totalPrincipalOutstanding: Number(stats.totalPrincipalOutstanding ?? 0),
        totalLoanRepayment: Number(stats.totalLoanRepayment ?? 0),
      });
    } catch {
      setBankAdminStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [isAdmin, statsPeriod, statsUseCustomRange, statsStartDate, statsEndDate]);

  const fetchBankAdminAdditionalStats = useCallback(async () => {
    if (!isAdmin) return;
    setAdditionalStatsLoading(true);
    try {
      const response = await bankAdminService.getAdditionalStats();
      if (response.status === 200) {
        const data = response.data?.data || response.data;
        const stats = data?.stats || data || {};
        setBankAdminAdditionalStats({
          recentApplications: Array.isArray(stats.recentApplications)
            ? stats.recentApplications
            : [],
          highRiskBorrowers: stats.highRiskBorrowers || 0,
          loansNearDefault: stats.loansNearDefault || 0,
        });
      }
    } catch {
      setBankAdminAdditionalStats(null);
    } finally {
      setAdditionalStatsLoading(false);
    }
  }, [isAdmin]);

  const fetchGraphsData = useCallback(async () => {
    if (!isAdmin) return;
    setGraphsLoading(true);
    try {
      const response = await bankAdminService.getGraphsData({ days: 90 });
      if (response.status === 200) {
        const raw = response.data?.data ?? response.data;
        const data = raw?.graphs ?? raw;
        const mapBranchExposure = (arr: any[]) =>
          (arr ?? []).map((x: any) => ({
            branchName: x.branchName ?? x.branch_name ?? x.branch ?? '',
            exposure: Number(x.exposure ?? x.amount ?? 0),
          }));
        const mapDPDBuckets = (arr: any[]) =>
          (arr ?? []).map((x: any) => ({
            bucket: x.bucket ?? x.label ?? '',
            count: Number(x.count ?? x.value ?? 0),
          }));
        const mapTrendData = (arr: any[]) =>
          (arr ?? []).map((x: any) => ({
            date: x.date ?? x.day ?? '',
            amount: Number(x.amount ?? x.value ?? 0),
          }));

        setGraphsData({
          disbursementTrend: mapTrendData(
            data?.disbursementTrend ?? data?.disbursement_trend ?? []
          ),
          collectionTrend: mapTrendData(data?.collectionTrend ?? data?.collection_trend ?? []),
          dpdBuckets: mapDPDBuckets(data?.dpdBuckets ?? data?.dpd_buckets ?? []),
          branchExposure: mapBranchExposure(data?.branchExposure ?? data?.branch_exposure ?? []),
        });
      }
    } catch {
      setGraphsData(null);
    } finally {
      setGraphsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSuperAdminStats();
    } else if (isAdmin) {
      fetchBankAdminStats();
      fetchBankAdminAdditionalStats();
      fetchGraphsData();
    }
  }, [
    isSuperAdmin,
    isAdmin,
    fetchSuperAdminStats,
    fetchBankAdminStats,
    fetchBankAdminAdditionalStats,
    fetchGraphsData,
  ]);

  const handlePaymentSuccess = () => {
    setOpenPaymentDialog(false);
    if (isSuperAdmin) {
      fetchSuperAdminStats();
    }
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
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1600, mx: 'auto' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h4">
          {isSuperAdmin ? 'Platform Overview' : 'Portfolio Overview'}
        </Typography>
        {/* {isSuperAdmin && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:wallet-money-bold" />}
            onClick={() => setOpenPaymentDialog(true)}
            size="small"
          >
            Record Bank Payment
          </Button>
        )} */}
      </Box>

      {/* Super Admin: Platform stats */}
      {isSuperAdmin && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {statsLoading ? (
            [1, 2, 3, 4].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          ) : superAdminStats ? (
            <>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  title="Total Banks"
                  value={fNumber(superAdminStats.totalBanks)}
                  icon="duo-icons:bank"
                  color="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  title="Active Subscriptions"
                  value={fNumber(superAdminStats.activeSubscriptions)}
                  icon="solar:card-bold-duotone"
                  color="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  title="Expired Subscriptions"
                  value={fNumber(superAdminStats.expiredSubscriptions)}
                  icon="solar:clock-circle-bold-duotone"
                  color="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  title="Revenue"
                  value={fCurrency(superAdminStats.totalRevenue)}
                  icon="solar:wallet-money-bold-duotone"
                  color="primary"
                />
              </Grid>
            </>
          ) : null}
        </Grid>
      )}

      {/* Bank Admin: KPI Section */}
      {isAdmin && (
        <>
          {/* Stats period filter — compact chip-style */}
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
            sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Iconify icon="solar:calendar-bold-duotone" width={20} sx={{ color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Period:
            </Typography>
            {(['default', 'today', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
              <Chip
                key={p}
                size="small"
                label={
                  p === 'default'
                    ? 'MTD'
                    : p === 'today'
                      ? 'Today'
                      : p === 'weekly'
                        ? '7 days'
                        : p === 'monthly'
                          ? 'Month'
                          : 'Year'
                }
                onClick={() => {
                  setStatsUseCustomRange(false);
                  setStatsPeriod(p);
                }}
                color={!statsUseCustomRange && statsPeriod === p ? 'primary' : 'default'}
                variant={!statsUseCustomRange && statsPeriod === p ? 'filled' : 'outlined'}
                sx={{ fontWeight: !statsUseCustomRange && statsPeriod === p ? 600 : 400 }}
              />
            ))}
            <Chip
              size="small"
              label="Custom"
              onClick={() => setStatsUseCustomRange(true)}
              color={statsUseCustomRange ? 'primary' : 'default'}
              variant={statsUseCustomRange ? 'filled' : 'outlined'}
              sx={{ fontWeight: statsUseCustomRange ? 600 : 400 }}
            />
            {statsUseCustomRange && (
              <Stack direction="row" alignItems="center" gap={1} sx={{ ml: 1 }}>
                <TextField
                  size="small"
                  type="date"
                  value={statsStartDate}
                  onChange={(e) => setStatsStartDate(e.target.value)}
                  slotProps={{
                    input: { sx: { fontSize: '0.8125rem', py: 0.75 }, inputProps: { max: statsEndDate } },
                    inputLabel: { shrink: true },
                  }}
                  sx={{ width: 150 }}
                />
                <Typography variant="body2" color="text.disabled">
                  –
                </Typography>
                <TextField
                  size="small"
                  type="date"
                  value={statsEndDate}
                  onChange={(e) => setStatsEndDate(e.target.value)}
                  slotProps={{
                    input: { sx: { fontSize: '0.8125rem', py: 0.75 }, inputProps: { min: statsStartDate } },
                    inputLabel: { shrink: true },
                  }}
                  sx={{ width: 150 }}
                />
              </Stack>
            )}
            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
              {bank?.slug && (
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<Iconify icon="solar:copy-bold" width={16} />}
                  onClick={handleCopyRegisterLink}
                >
                  Copy registration link
                </Button>
              )}
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:refresh-bold" width={16} />}
                onClick={() => {
                  fetchBankAdminStats();
                  fetchBankAdminAdditionalStats();
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>

          {/* Row 1 — 4 primary KPI cards, each shows main + sub metrics */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {statsLoading ? (
              [1, 2, 3, 4].map((i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
                </Grid>
              ))
            ) : bankAdminStats ? (
              <>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <KpiCard
                    title="Portfolio Outstanding"
                    primary={fCurrency(bankAdminStats.totalPortfolioOutstanding)}
                    icon="solar:wallet-money-bold-duotone"
                    subs={[
                      {
                        label: 'Principal',
                        value: fCurrency(bankAdminStats.totalPrincipalOutstanding),
                      },
                      {
                        label: 'Interest',
                        value: fCurrency(bankAdminStats.totalInterestOutstanding),
                      },
                    ]}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <KpiCard
                    title="Active Loans"
                    primary={fNumber(bankAdminStats.activeLoans)}
                    icon="solar:document-text-bold-duotone"
                    subs={[
                      { label: 'Borrowers', value: fNumber(bankAdminStats.activeBorrowers) },
                      {
                        label: 'Disbursed MTD',
                        value: fCurrency(bankAdminStats.totalDisbursedMTD),
                      },
                    ]}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <KpiCard
                    title="PAR"
                    primary={formatPercent(bankAdminStats.par)}
                    icon="solar:danger-triangle-bold-duotone"
                    subs={[
                      { label: 'Overdue', value: fCurrency(bankAdminStats.totalOverdueAmount) },
                      { label: 'Audit Score', value: `${bankAdminStats.auditReadiness}%` },
                    ]}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <KpiCard
                    title="Recovery Today"
                    primary={fCurrency(bankAdminStats.recoveryToday)}
                    icon="solar:graph-up-bold-duotone"
                    subs={[
                      { label: 'Recovery Rate', value: formatPercent(bankAdminStats.recoveryRate) },
                      { label: 'Bank Capital', value: fCurrency(bankAdminStats.bankCapital) },
                    ]}
                  />
                </Grid>
              </>
            ) : null}
          </Grid>

          {/* Row 2 — compact secondary metrics + risk alerts in one card */}
          {!statsLoading && bankAdminStats && (
            <Card sx={{ mb: 3, p: { xs: 2, sm: 2.5 } }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle1">Quick Stats</Typography>
                {bankAdminAdditionalStats && !additionalStatsLoading && (
                  <Stack direction="row" spacing={1.5}>
                    <RiskBadge
                      label="High Risk"
                      value={fNumber(bankAdminAdditionalStats.highRiskBorrowers)}
                      icon="solar:shield-warning-bold-duotone"
                    />
                    <RiskBadge
                      label="Near Default"
                      value={fNumber(bankAdminAdditionalStats.loansNearDefault)}
                      icon="solar:bell-bing-bold-duotone"
                    />
                  </Stack>
                )}
              </Stack>
              <Grid container spacing={0}>
                {[
                  {
                    label: 'Total Portfolio Outstanding',
                    value: fCurrency(bankAdminStats.totalPortfolioOutstanding),
                  },
                  {
                    label: 'Total Principal Outstanding',
                    value: fCurrency(bankAdminStats.totalPrincipalOutstanding),
                  },
                  {
                    label: 'Total Interest Outstanding',
                    value: fCurrency(bankAdminStats.totalInterestOutstanding),
                  },
                  {
                    label: 'Total Disbursed (MTD)',
                    value: fCurrency(bankAdminStats.totalDisbursedMTD),
                  },
                  {
                    label: 'Total Overdue Amount',
                    value: fCurrency(bankAdminStats.totalOverdueAmount),
                  },
                  { label: 'Bank Capital', value: fCurrency(bankAdminStats.bankCapital) },
                  { label: 'Active Loans', value: fNumber(bankAdminStats.activeLoans) },
                  { label: 'Active Borrowers', value: fNumber(bankAdminStats.activeBorrowers) },
                  { label: 'PAR %', value: formatPercent(bankAdminStats.par) },
                  { label: 'Recovery Rate', value: formatPercent(bankAdminStats.recoveryRate) },
                  { label: 'Total Repayments', value: fCurrency(bankAdminStats.totalLoanRepayment) },
                  { label: 'Audit Readiness', value: `${bankAdminStats.auditReadiness}%` },
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1.25,
                        borderRight: '1px solid',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block" noWrap>
                        {item.label}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          )}
        </>
      )}

      {/* Bank Admin: Middle Section — Charts */}
      {isAdmin && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ p: { xs: 2, sm: 2.5 }, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Disbursement Trend
              </Typography>
              {graphsLoading ? (
                <Skeleton variant="rounded" height={260} sx={{ borderRadius: 1 }} />
              ) : (
                <DisbursementTrendChart data={graphsData?.disbursementTrend} />
              )}
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ p: { xs: 2, sm: 2.5 }, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Collection Trend
              </Typography>
              {graphsLoading ? (
                <Skeleton variant="rounded" height={260} sx={{ borderRadius: 1 }} />
              ) : (
                <CollectionTrendChart data={graphsData?.collectionTrend} />
              )}
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ p: { xs: 2, sm: 2.5 }, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                DPD Buckets
              </Typography>
              {graphsLoading ? (
                <Skeleton variant="rounded" height={260} sx={{ borderRadius: 1 }} />
              ) : (
                <DPDBucketsChart data={graphsData?.dpdBuckets} />
              )}
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ p: { xs: 2, sm: 2.5 }, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Branch-wise Exposure
              </Typography>
              {graphsLoading ? (
                <Skeleton variant="rounded" height={260} sx={{ borderRadius: 1 }} />
              ) : (
                <BranchExposureChart data={graphsData?.branchExposure} />
              )}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Bank Admin: Recent Applications & Registration Link */}
      {isAdmin && (
        <>
          {/* Recent Applications Table */}
          <Card sx={{ mb: 3, overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Recent Applications
              </Typography>
              {additionalStatsLoading ? (
                <Box sx={{ py: 2 }}>
                  <Skeleton variant="rounded" height={180} />
                </Box>
              ) : bankAdminAdditionalStats?.recentApplications &&
                bankAdminAdditionalStats.recentApplications.length > 0 ? (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 560 }}>
                    <TableBody>
                      {bankAdminAdditionalStats.recentApplications.map((app) => (
                        <TableRow key={app.id} hover>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2">{app.customerName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {app.cnic}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{fCurrency(app.amount)}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {app.durationMonths} months
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{app.city}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {app.region}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  app.status === 'approved'
                                    ? 'success.main'
                                    : app.status === 'rejected'
                                      ? 'error.main'
                                      : 'warning.main',
                                fontWeight: 500,
                                textTransform: 'capitalize',
                              }}
                            >
                              {app.status.replace('_', ' ')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {fDate(app.createdAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent applications found
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </>
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
        p: { xs: 2, sm: 2.5 },
        boxShadow: theme.customShadows?.card || 'none',
        height: '100%',
        minHeight: { xs: 90, sm: 100 },
        display: 'flex',
        ...sx,
      }}
      {...other}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
        sx={{ flex: 1, minWidth: 0 }}
      >
        <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            {title}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              fontWeight: 700,
              lineHeight: 1.3,
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
            width: { xs: 40, sm: 44 },
            height: { xs: 40, sm: 44 },
            flexShrink: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette[color].main, 0.16),
          }}
        >
          <Iconify icon={icon} width={22} sx={{ color: `${color}.main` }} />
        </Box>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

type KpiCardProps = {
  title: string;
  primary: string;
  icon: string;
  subs?: { label: string; value: string }[];
};

function KpiCard({ title, primary, icon, subs }: KpiCardProps) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        p: { xs: 2, sm: 2.5 },
        height: '100%',
        borderTop: 3,
        borderColor: 'primary.main',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" noWrap>
            {title}
          </Typography>
          <Typography
            variant="h5"
            fontWeight={700}
            color="primary.main"
            sx={{ mt: 0.5, mb: subs?.length ? 1.5 : 0, lineHeight: 1.2 }}
          >
            {primary}
          </Typography>
          {subs && (
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {subs.map((s) => (
                <Box key={s.label}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {s.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {s.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          <Iconify icon={icon} width={22} sx={{ color: 'primary.main' }} />
        </Box>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

type RiskBadgeProps = {
  label: string;
  value: string;
  icon: string;
};

function RiskBadge({ label, value, icon }: RiskBadgeProps) {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{
        px: 1.5,
        py: 0.75,
        borderRadius: 1,
        bgcolor: alpha(theme.palette.primary.main, 0.08),
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.2),
      }}
    >
      <Iconify icon={icon} width={16} sx={{ color: 'primary.main' }} />
      <Typography variant="caption" color="primary.main" fontWeight={600}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

// Disbursement Trend Chart Component
function DisbursementTrendChart({ data }: { data?: GraphDataPoint[] }) {
  const theme = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);

  const chartData = data?.length
    ? data.map((d) => [dayjs(d.date).valueOf(), Number(d.amount)])
    : [];

  const chartOptions = useChart({
    colors: [theme.palette.primary.main],
    stroke: { width: 2 },
    markers: {
      size: 4,
      strokeWidth: 0,
      hover: { size: 6 },
    },
    chart: {
      zoom: {
        enabled: chartData.length > 1,
        type: 'x',
        allowMouseWheelZoom: chartData.length > 1,
      },
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        format: 'dd MMM',
        datetimeUTC: false,
      },
      min: chartData.length === 1 ? chartData[0][0] - 86400000 : undefined,
      max: chartData.length === 1 ? chartData[0][0] + 86400000 : undefined,
    },
    tooltip: {
      x: {
        formatter: (value: number) => dayjs(value).format('DD MMM YYYY'),
      },
      y: {
        formatter: (value: number) => fCurrency(value),
      },
    },
    legend: { show: false },
    grid: {
      show: true,
      borderColor: theme.palette.divider,
    },
  });

  const chartSeries = [
    {
      name: 'Disbursement',
      data: chartData,
    },
  ];

  // Handle mouse wheel zoom
  useEffect(() => {
    const chartElement = chartRef.current;
    if (!chartElement) return () => {};

    const handleWheel = (e: WheelEvent) => {
      const chartContainer = chartElement.querySelector('[id^="apexcharts"]') as HTMLElement;
      if (!chartContainer) return;

      e.preventDefault();
      e.stopPropagation();

      const chartId = chartContainer.getAttribute('id');
      if (chartId && (window as any).ApexCharts) {
        const apexChart = (window as any).ApexCharts.exec(chartId);
        if (apexChart) {
          if (e.deltaY < 0) {
            apexChart.zoomIn();
          } else {
            apexChart.zoomOut();
          }
        }
      }
    };

    chartElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      chartElement.removeEventListener('wheel', handleWheel);
    };
  }, []);

  if (!chartData.length) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No disbursement data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box ref={chartRef} sx={{ position: 'relative' }}>
      <Chart
        type="line"
        series={chartSeries}
        options={chartOptions}
        sx={{
          height: { xs: 220, sm: 260 },
          mt: 1,
        }}
      />
    </Box>
  );
}

// Loan Collection Trend Chart Component
function CollectionTrendChart({ data }: { data?: GraphDataPoint[] }) {
  const theme = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);

  const chartData = data?.length
    ? data.map((d) => [dayjs(d.date).valueOf(), Number(d.amount)])
    : [];

  const chartOptions = useChart({
    colors: [theme.palette.success.main],
    stroke: { width: 2 },
    markers: {
      size: 4,
      strokeWidth: 0,
      hover: { size: 6 },
    },
    chart: {
      zoom: {
        enabled: chartData.length > 1,
        type: 'x',
        allowMouseWheelZoom: chartData.length > 1,
      },
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        format: 'dd MMM',
        datetimeUTC: false,
      },
      min: chartData.length === 1 ? chartData[0][0] - 86400000 : undefined,
      max: chartData.length === 1 ? chartData[0][0] + 86400000 : undefined,
    },
    tooltip: {
      x: {
        formatter: (value: number) => dayjs(value).format('DD MMM YYYY'),
      },
      y: {
        formatter: (value: number) => fCurrency(value),
      },
    },
    legend: { show: false },
    grid: {
      show: true,
      borderColor: theme.palette.divider,
    },
  });

  const chartSeries = [
    {
      name: 'Collection',
      data: chartData,
    },
  ];

  // Handle mouse wheel zoom
  useEffect(() => {
    const chartElement = chartRef.current;
    if (!chartElement) return () => {};

    const handleWheel = (e: WheelEvent) => {
      const chartContainer = chartElement.querySelector('[id^="apexcharts"]') as HTMLElement;
      if (!chartContainer) return;

      e.preventDefault();
      e.stopPropagation();

      const chartId = chartContainer.getAttribute('id');
      if (chartId && (window as any).ApexCharts) {
        const apexChart = (window as any).ApexCharts.exec(chartId);
        if (apexChart) {
          if (e.deltaY < 0) {
            apexChart.zoomIn();
          } else {
            apexChart.zoomOut();
          }
        }
      }
    };

    chartElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      chartElement.removeEventListener('wheel', handleWheel);
    };
  }, []);

  if (!chartData.length) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No collection data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box ref={chartRef} sx={{ position: 'relative' }}>
      <Chart
        type="line"
        series={chartSeries}
        options={chartOptions}
        sx={{
          height: { xs: 220, sm: 260 },
          mt: 1,
        }}
      />
    </Box>
  );
}

// DPD Buckets Bar Chart Component
function DPDBucketsChart({ data }: { data?: DPDBucketItem[] }) {
  const theme = useTheme();

  const categories = data?.map((d) => d.bucket) ?? [
    '0 DPD',
    '1-30 DPD',
    '31-60 DPD',
    '61-90 DPD',
    '90+ DPD',
  ];
  const seriesData = data?.map((d) => d.count) ?? [];

  const chartOptions = useChart({
    colors: [
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.error.dark,
    ],
    stroke: { width: 0 },
    xaxis: {
      categories,
    },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => fNumber(val),
    },
  });

  const chartSeries = [
    {
      name: 'Number of Loans',
      data: seriesData,
    },
  ];

  if (!seriesData.length) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No DPD bucket data available
        </Typography>
      </Box>
    );
  }

  return (
    <Chart
      type="bar"
      series={chartSeries}
      options={chartOptions}
      sx={{
        height: { xs: 220, sm: 260 },
        mt: 1,
      }}
    />
  );
}

// Branch-wise Exposure Chart Component
function BranchExposureChart({ data }: { data?: BranchExposureItem[] }) {
  const theme = useTheme();

  const categories = data?.map((d) => d.branchName) ?? [];
  const seriesData = data?.map((d) => d.exposure) ?? [];

  const chartOptions = useChart({
    colors: [theme.palette.primary.main],
    stroke: { width: 0 },
    xaxis: {
      categories,
    },
    tooltip: {
      y: {
        formatter: (value: number) => fCurrency(value),
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
        horizontal: false,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => fCurrency(val),
    },
  });

  const chartSeries = [
    {
      name: 'Exposure',
      data: seriesData,
    },
  ];

  if (!seriesData.length) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No branch exposure data available
        </Typography>
      </Box>
    );
  }

  return (
    <Chart
      type="bar"
      series={chartSeries}
      options={chartOptions}
      sx={{
        height: { xs: 220, sm: 260 },
        mt: 1,
      }}
    />
  );
}

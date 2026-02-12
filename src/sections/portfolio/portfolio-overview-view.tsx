/**
 * Portfolio Overview View
 * Displays portfolio statistics and metrics table
 */

import type { CardProps } from '@mui/material/Card';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

import { useAuth } from 'src/hooks/use-auth';

import { fNumber, fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

import { BankPaymentDialog } from 'src/sections/bank/payments/bank-payment-dialog';

import { UserRole } from 'src/types/auth.types';

// ----------------------------------------------------------------------

// Mock data - will be replaced with real API data later
const PORTFOLIO_STATS = {
  activeBorrowers: {
    value: 1248,
    trend: 12.5,
    isIncrease: true,
  },
  outstandingPortfolio: {
    value: 45678900,
    trend: 8.2,
    isIncrease: true,
  },
  par30: {
    value: 3.2,
    trend: -0.5,
    isIncrease: false,
  },
};

const PORTFOLIO_METRICS = [
  {
    metric: 'Total Loan Portfolio',
    value: 'PKR 45,678,900',
    status: 'healthy',
    statusLabel: 'Healthy',
  },
  {
    metric: 'Average Loan Size',
    value: 'PKR 36,602',
    status: 'neutral',
    statusLabel: 'Normal',
  },
  {
    metric: 'Portfolio Growth (YTD)',
    value: '+18.5%',
    status: 'healthy',
    statusLabel: 'Growing',
  },
  {
    metric: 'PAR (Portfolio at Risk) 30+',
    value: '3.2%',
    status: 'warning',
    statusLabel: 'Monitor',
  },
  {
    metric: 'PAR 90+',
    value: '1.8%',
    status: 'healthy',
    statusLabel: 'Good',
  },
  {
    metric: 'Write-off Ratio',
    value: '0.5%',
    status: 'healthy',
    statusLabel: 'Excellent',
  },
  {
    metric: 'Repayment Rate',
    value: '96.8%',
    status: 'healthy',
    statusLabel: 'Excellent',
  },
  {
    metric: 'Active Loan Accounts',
    value: '1,248',
    status: 'neutral',
    statusLabel: 'Active',
  },
  {
    metric: 'Overdue Loans',
    value: '84',
    status: 'warning',
    statusLabel: 'Attention',
  },
  {
    metric: 'Disbursements (This Month)',
    value: 'PKR 2,345,000',
    status: 'healthy',
    statusLabel: 'Good',
  },
];

// ----------------------------------------------------------------------

export function PortfolioOverviewView() {
  const theme = useTheme();
  const { user } = useAuth();
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  const handlePaymentSuccess = () => {
    // Optionally refresh data or show success message
    setOpenPaymentDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Portfolio Overview</Typography>
        {isSuperAdmin && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:wallet-money-bold" />}
            onClick={() => setOpenPaymentDialog(true)}
          >
            Record Bank Payment
          </Button>
        )}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Active Borrowers"
            value={fNumber(PORTFOLIO_STATS.activeBorrowers.value)}
            icon="solar:users-group-rounded-bold-duotone"
            color="primary"
            trend={PORTFOLIO_STATS.activeBorrowers.trend}
            isIncrease={PORTFOLIO_STATS.activeBorrowers.isIncrease}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Outstanding Portfolio"
            value={fCurrency(PORTFOLIO_STATS.outstandingPortfolio.value)}
            icon="solar:wallet-money-bold-duotone"
            color="success"
            trend={PORTFOLIO_STATS.outstandingPortfolio.trend}
            isIncrease={PORTFOLIO_STATS.outstandingPortfolio.isIncrease}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="PAR (30+)"
            value={`${PORTFOLIO_STATS.par30.value}%`}
            icon="solar:danger-triangle-bold-duotone"
            color="warning"
            trend={PORTFOLIO_STATS.par30.trend}
            isIncrease={PORTFOLIO_STATS.par30.isIncrease}
          />
        </Grid>
      </Grid>

      {/* Metrics Table */}
      <Card>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Portfolio Metrics
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2">Metric</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">Value</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">Status</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {PORTFOLIO_METRICS.map((row) => (
                  <TableRow
                    key={row.metric}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.04) },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2">{row.metric}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">{row.value}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={row.statusLabel}
                        size="small"
                        color={
                          row.status === 'healthy'
                            ? 'success'
                            : row.status === 'warning'
                              ? 'warning'
                              : 'default'
                        }
                        variant="filled"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Card>

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
        p: 3,
        boxShadow: theme.customShadows.card,
        ...sx,
      }}
      {...other}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Stack spacing={1} sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            {title}
          </Typography>
          <Typography variant="h3">{value}</Typography>

          {trend !== undefined && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify
                icon={isIncrease ? 'eva:trending-up-fill' : 'eva:trending-down-fill'}
                sx={{
                  color: isIncrease ? 'success.main' : 'error.main',
                  width: 20,
                  height: 20,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: isIncrease ? 'success.main' : 'error.main',
                  fontWeight: 600,
                }}
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
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette[color].main, 0.16),
          }}
        >
          <Iconify icon={icon} width={32} sx={{ color: `${color}.main` }} />
        </Box>
      </Stack>
    </Card>
  );
}

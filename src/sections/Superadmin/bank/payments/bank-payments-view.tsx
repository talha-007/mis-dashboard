import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import paymentService from 'src/redux/services/payment.services';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type SubscriptionStatus = 'active' | 'expired' | 'pending' | 'cancelled' | 'suspended';

interface BankSubscription {
  _id: string;
  bankId: {
    _id: string;
    name: string;
    code: string;
  };
  status: SubscriptionStatus | string;
  amount: number;
  datePaid: string;
  nextPayDate: string;
  createdAt: string;
  updatedAt: string;
}

export function BankPaymentsView() {
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [subscriptions, setSubscriptions] = useState<BankSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.getBankSubscriptions({
        search: filterName || undefined,
        page: page + 1,
        limit: rowsPerPage,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });

      const data = response.data?.data || response.data?.subscriptions || response.data || [];
      const count =
        response.data?.pagination?.total ??
        response.data?.total ??
        response.data?.count ??
        (Array.isArray(data) ? data.length : 0);

      setSubscriptions(Array.isArray(data) ? data : []);
      setTotalCount(count);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to fetch subscriptions';
      setError(errorMsg);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, [filterName, filterStatus, page, rowsPerPage]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  const handleRenewSubscription = async (subscriptionId: string) => {
    try {
      setError(null);
      await paymentService.renewSubscription(subscriptionId);
      setSuccessMessage('Subscription renewed successfully');
      fetchSubscriptions();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to renew subscription';
      setError(errorMsg);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      setError(null);
      await paymentService.cancelSubscription(subscriptionId);
      setSuccessMessage('Subscription cancelled successfully');
      fetchSubscriptions();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to cancel subscription';
      setError(errorMsg);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4">Subscriptions</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Summary Cards */}
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(4, 1fr)' }} gap={3} mb={3}>
        <Card sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Subscriptions
              </Typography>
              <Typography variant="h4">{subscriptions.length}</Typography>
            </Box>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
              }}
            >
              <Iconify icon="solar:wallet-money-bold" width={32} />
            </Box>
          </Box>
        </Card>

        <Card sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Subscriptions
              </Typography>
              <Typography variant="h4">
                {subscriptions.filter((s) => s.status === 'active').length}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'success.lighter',
                color: 'success.main',
              }}
            >
              <Iconify icon="solar:check-circle-bold" width={32} />
            </Box>
          </Box>
        </Card>

        <Card sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">
                {fCurrency(subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0))}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'info.lighter',
                color: 'info.main',
              }}
            >
              <Iconify icon="solar:card-bold" width={32} />
            </Box>
          </Box>
        </Card>

        <Card sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Expired Subscriptions
              </Typography>
              <Typography variant="h4" color="error.main">
                {subscriptions.filter((s) => s.status === 'expired').length}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'error.lighter',
                color: 'error.main',
              }}
            >
              <Iconify icon="solar:calendar-mark-bold" width={32} />
            </Box>
          </Box>
        </Card>
      </Box>

      <Card>
        {/* Filters */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              placeholder="Search subscriptions..."
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
             
            </TextField>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bank</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date Paid</TableCell>
                      <TableCell>Next Pay Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                          <Typography variant="body2" color="text.secondary">
                            No subscriptions found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscriptions.map((subscription) => (
                        <TableRow key={subscription._id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2">
                                {subscription.bankId?.name ?? '-'}
                              </Typography>
                              {subscription.bankId?.code && (
                                <Typography variant="caption" color="text.secondary">
                                  {subscription.bankId.code}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {fCurrency(subscription.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Label color={getStatusColor(subscription.status)}>
                              {subscription.status}
                            </Label>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {subscription.datePaid ? fDate(subscription.datePaid) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {subscription.nextPayDate ? fDate(subscription.nextPayDate) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box display="flex" gap={1} justifyContent="flex-end">
                              {subscription.status === 'expired' && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleRenewSubscription(subscription._id)}
                                >
                                  Renew
                                </Button>
                              )}
                              {subscription.status === 'active' && (
                                <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  onClick={() => handleCancelSubscription(subscription._id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={page}
              count={totalCount || subscriptions.length}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPageOptions={[5, 10, 25, 50]}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Card>
    </DashboardContent>
  );
}

/**
 * Subscription Required View
 * Shown to bank admin when subscription is inactive. Shows amount and Pay button; calls POST /subscriptions.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { fetchMe } from 'src/redux/slice/authSlice';
import { useAppDispatch, useAppSelector } from 'src/store';
import paymentService from 'src/redux/services/payment.services';
import { DashboardContent } from 'src/layouts/dashboard/content';

import { Iconify } from 'src/components/iconify';

import { isSubscriptionActive } from 'src/types/auth.types';

const SUBSCRIPTION_AMOUNT = 20;

export function SubscriptionRequiredView() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, bank } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const bankId = bank?.id;
  console.log('bankId', bankId);

  const handlePay = async () => {
    if (!bankId) {
      setError('Bank information not available. Please refresh the page.');
      return;
    }
    setError(null);
    setPaying(true);
    try {
      await paymentService.createSubscription({
        bankId,
        amount: SUBSCRIPTION_AMOUNT,
      });
      setSuccess(true);
      const result = await dispatch(fetchMe()).unwrap();
      if (result?.user && isSubscriptionActive(result.user)) {
        navigate('/', { replace: true });
        return;
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const handleRefreshStatus = async () => {
    setError(null);
    setRefreshing(true);
    try {
      const result = await dispatch(fetchMe()).unwrap();
      if (result?.user && isSubscriptionActive(result.user)) {
        navigate('/', { replace: true });
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ py: 4, maxWidth: 560, mx: 'auto' }}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Iconify
            icon="mdi:credit-card-outline"
            width={64}
            sx={{ color: 'warning.main', mb: 2 }}
          />
          <Typography variant="h5" sx={{ mb: 1 }}>
            Subscription required
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Your bank account subscription is currently inactive. Pay the subscription amount below
            to access the dashboard and manage borrowers, loans, and reports.
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: 'action.hover',
              textAlign: 'center',
              mb: 3,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Subscription amount
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.5 }}>
              ${SUBSCRIPTION_AMOUNT}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Payment successful. Refreshing your access…
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              size="large"
              variant="contained"
              disabled={paying || !bankId}
              startIcon={
                paying ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Iconify icon="eva:credit-card-outline" width={20} />
                )
              }
              onClick={handlePay}
            >
              {paying ? 'Processing…' : 'Pay now'}
            </Button>
            <Button
              size="large"
              variant="outlined"
              disabled={refreshing}
              startIcon={
                refreshing ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Iconify icon="eva:refresh-outline" width={20} />
                )
              }
              onClick={handleRefreshStatus}
            >
              {refreshing ? 'Checking…' : 'Refresh status'}
            </Button>
          </Box>

          {user?.email && (
            <Typography variant="caption" display="block" sx={{ mt: 3, color: 'text.secondary' }}>
              Logged in as {user.email}
            </Typography>
          )}
        </Card>
      </Box>
    </DashboardContent>
  );
}

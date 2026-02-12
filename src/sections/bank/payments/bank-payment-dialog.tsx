import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import bankService from 'src/redux/services/bank.services';
import paymentService from 'src/redux/services/payment.services';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type BankPaymentDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

interface BankDetails {
  _id: string;
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  status: string;
}

interface SubscriptionDetails {
  lastPayment?: {
    date: string;
    amount: number;
    method: string;
    transactionId?: string;
  };
  nextPaymentAmount: number;
  subscriptionStatus?: string;
  subscriptionEndDate?: string;
}

export function BankPaymentDialog({ open, onClose, onSuccess }: BankPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankCode, setBankCode] = useState('');
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    paymentMethod: 'bank_transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionId: '',
    notes: '',
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setBankCode('');
      setBankDetails(null);
      setSubscriptionDetails(null);
      setPaymentId(null);
      setFormData({
        paymentMethod: 'bank_transfer',
        paymentDate: new Date().toISOString().split('T')[0],
        transactionId: '',
        notes: '',
      });
      setError(null);
    }
  }, [open]);

  // Search bank by code
  const searchBank = useCallback(async (code: string) => {
    if (!code || code.trim().length < 2) {
      setBankDetails(null);
      setSubscriptionDetails(null);
      return;
    }

    try {
      setSearching(true);
      setError(null);

      const response = await bankService.searchBankByCode(code.trim());
      const bank = response.data?.data || response.data;

      if (bank) {
        setBankDetails(bank);

        // Fetch subscription details
        try {
          const subResponse = await bankService.getBankSubscriptionDetails(bank._id || bank.id);
          const subData = subResponse.data?.data || subResponse.data;
          setSubscriptionDetails(subData || { nextPaymentAmount: 0 });
        } catch (err: any) {
          // If no subscription found, set default
          console.log(err);

          setSubscriptionDetails({ nextPaymentAmount: 0 });
        }
      } else {
        setBankDetails(null);
        setSubscriptionDetails(null);
        setError('Bank not found');
      }
    } catch (err: any) {
      setBankDetails(null);
      setSubscriptionDetails(null);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to search bank';
      setError(errorMsg);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (bankCode) {
        searchBank(bankCode);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [bankCode, searchBank]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!bankDetails) {
      setError('Please search and select a bank');
      return false;
    }
    if (!subscriptionDetails?.nextPaymentAmount || subscriptionDetails.nextPaymentAmount <= 0) {
      setError('Next payment amount is not available');
      return false;
    }
    if (!formData.paymentDate) {
      setError('Please select a payment date');
      return false;
    }
    return true;
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await paymentService.generateInvoice(invoiceId);

      // Create blob and download
      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: 'application/pdf' });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${bankDetails?.code || 'bank'}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to download invoice:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to download invoice';
      setError(errorMsg);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const paymentData = {
        bankId: bankDetails!._id || bankDetails!.id,
        amount: subscriptionDetails!.nextPaymentAmount,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        transactionId: formData.transactionId || undefined,
        notes: formData.notes || undefined,
      };

      const response = await paymentService.recordPayment(paymentData);
      const payment = response.data?.data || response.data;
      const recordedPaymentId = payment?.paymentId || payment?._id || payment?.id;

      if (recordedPaymentId) {
        setPaymentId(recordedPaymentId);
        // Automatically download invoice
        try {
          await downloadInvoice(recordedPaymentId);
        } catch (invoiceErr) {
          // If invoice download fails, still show success but log error
          console.error('Invoice download failed:', invoiceErr);
        }
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to record payment';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="solar:wallet-money-bold" width={24} />
            <Typography variant="h6">Record Bank Payment</Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {error && !searching && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Bank Code Search */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  label="Bank Code"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  disabled={loading}
                  placeholder="Enter bank code (e.g., NMB001)"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {searching ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                        )}
                      </InputAdornment>
                    ),
                  }}
                  helperText="Search bank by code to fetch details"
                />
              </Grid>

              {/* Bank Details Card */}
              {bankDetails && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
                      <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Bank Details
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 0.5 }}>
                              {bankDetails.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Code: {bankDetails.code}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {bankDetails.email} • {bankDetails.phone}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {bankDetails.address}
                            </Typography>
                          </Box>
                          <Label
                            color={
                              bankDetails.status === 'active'
                                ? 'success'
                                : bankDetails.status === 'inactive'
                                  ? 'error'
                                  : 'warning'
                            }
                          >
                            {bankDetails.status}
                          </Label>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>

                  {/* Subscription Details */}
                  {subscriptionDetails && (
                    <Grid size={{ xs: 12 }}>
                      <Card sx={{ p: 3, border: 1, borderColor: 'divider' }}>
                        <Stack spacing={2}>
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Subscription Information
                          </Typography>

                          {subscriptionDetails.lastPayment && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Last Payment
                              </Typography>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{ mt: 0.5 }}
                              >
                                <Box>
                                  <Typography variant="body2">
                                    {fDate(subscriptionDetails.lastPayment.date)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {subscriptionDetails.lastPayment.method} •{' '}
                                    {subscriptionDetails.lastPayment.transactionId ||
                                      'No reference'}
                                  </Typography>
                                </Box>
                                <Typography variant="subtitle2">
                                  {fCurrency(subscriptionDetails.lastPayment.amount)}
                                </Typography>
                              </Stack>
                            </Box>
                          )}

                          {subscriptionDetails.lastPayment && <Divider />}

                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 1,
                              bgcolor: 'primary.lighter',
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography variant="subtitle2" color="primary.darker">
                                Next Payment Amount
                              </Typography>
                              <Typography variant="h5" color="primary.darker" fontWeight={700}>
                                {fCurrency(subscriptionDetails.nextPaymentAmount)}
                              </Typography>
                            </Stack>
                            <Typography
                              variant="caption"
                              color="primary.darker"
                              sx={{ mt: 1, display: 'block' }}
                            >
                              Monthly subscription fee
                            </Typography>
                          </Box>

                          {subscriptionDetails.subscriptionStatus && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Subscription Status
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                <Label
                                  color={
                                    subscriptionDetails.subscriptionStatus === 'active'
                                      ? 'success'
                                      : subscriptionDetails.subscriptionStatus === 'expired'
                                        ? 'error'
                                        : 'warning'
                                  }
                                >
                                  {subscriptionDetails.subscriptionStatus}
                                </Label>
                                {subscriptionDetails.subscriptionEndDate && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 1 }}
                                  >
                                    Ends: {fDate(subscriptionDetails.subscriptionEndDate)}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Stack>
                      </Card>
                    </Grid>
                  )}

                  {/* Payment Details */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      type="date"
                      label="Payment Date"
                      name="paymentDate"
                      value={formData.paymentDate}
                      onChange={handleChange}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      select
                      required
                      label="Payment Method"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="cheque">Cheque</MenuItem>
                      <MenuItem value="online">Online Payment</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Transaction ID / Reference"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Optional"
                      helperText="Payment reference number"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Additional notes about this payment..."
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !bankDetails || !subscriptionDetails?.nextPaymentAmount}
            startIcon={
              loading ? <CircularProgress size={20} /> : <Iconify icon="eva:checkmark-fill" />
            }
          >
            {loading ? 'Recording...' : 'Record Payment & Download Invoice'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

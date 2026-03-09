import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import payoffOfferService from 'src/redux/services/payoffOffer.services';
import { Iconify } from 'src/components/iconify';
import { useEffect, useState } from 'react';

// ----------------------------------------------------------------------

type PayoffOffer = {
  loanApplicationId: string;
  customerName: string;
  outstandingAmount: number;
  payoffOfferAmount: number;
};

export function PayoffOfferView() {
  const theme = useTheme();
  const [offers, setOffers] = useState<PayoffOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchPayoffOffer = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await payoffOfferService.getPayoffOffer();
      const data = response.data?.data ?? response.data;
      const list = data?.offers ?? [];
      setOffers(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load payoff offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (loanApplicationId: string) => {
    try {
      setAcceptingId(loanApplicationId);
      await payoffOfferService.acceptPayoffOffer(loanApplicationId);
      await fetchPayoffOffer();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to accept offer');
    } finally {
      setAcceptingId(null);
    }
  };

  useEffect(() => {
    fetchPayoffOffer();
  }, []);

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Payoff Offer
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : offers.length === 0 ? (
          <Card
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 2,
              boxShadow: theme.customShadows?.card,
            }}
          >
            <Iconify
              icon="solar:hand-money-bold-duotone"
              width={48}
              sx={{ color: 'text.disabled', mb: 2 }}
            />
            <Typography variant="body1" color="text.secondary">
              No payoff offers available
            </Typography>
          </Card>
        ) : (
          <Stack spacing={3} sx={{ maxWidth: 480, mx: 'auto' }}>
            {offers.map((offer) => {
              const savings = offer.outstandingAmount - offer.payoffOfferAmount;
              const savingsPercent =
                offer.outstandingAmount > 0
                  ? ((savings / offer.outstandingAmount) * 100).toFixed(0)
                  : '0';
              return (
                <Card
                  key={offer.loanApplicationId}
                  sx={{
                    overflow: 'hidden',
                    borderRadius: 2,
                    boxShadow: theme.customShadows?.card,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                        }}
                      >
                        <Iconify
                          icon="solar:hand-money-bold-duotone"
                          width={22}
                          sx={{ color: 'primary.main' }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Payoff Offer
                        </Typography>
                        {offer.customerName && (
                          <Typography variant="caption" color="text.secondary">
                            {offer.customerName}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>

                  {/* Amounts */}
                  <Stack spacing={0} sx={{ p: 3 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ py: 2 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Outstanding balance
                      </Typography>
                      <Typography variant="h6" sx={{ textDecoration: 'line-through' }}>
                        {fCurrency(offer.outstandingAmount)}
                      </Typography>
                    </Stack>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ py: 2 }}
                    >
                      <Typography variant="subtitle2" fontWeight={600}>
                        Payoff amount
                      </Typography>
                      <Typography variant="h4" color="primary.main" fontWeight={700}>
                        {fCurrency(offer.payoffOfferAmount)}
                      </Typography>
                    </Stack>

                    {savings > 0 && (
                      <Box
                        sx={{
                          mt: 1,
                          px: 2,
                          py: 1,
                          borderRadius: 1.5,
                          bgcolor: alpha(theme.palette.success.main, 0.08),
                          display: 'inline-flex',
                          alignSelf: 'flex-start',
                        }}
                      >
                        <Typography variant="caption" color="success.main" fontWeight={600}>
                          You save {fCurrency(savings)} ({savingsPercent}% off)
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {/* Action */}
                  <Box sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => handleAcceptOffer(offer.loanApplicationId)}
                      disabled={acceptingId === offer.loanApplicationId}
                      startIcon={
                        acceptingId !== offer.loanApplicationId ? (
                          <Iconify icon="solar:check-circle-bold" width={20} />
                        ) : undefined
                      }
                      sx={{
                        py: 1.5,
                        borderRadius: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.24)}`,
                      }}
                    >
                      {acceptingId === offer.loanApplicationId ? (
                        <CircularProgress size={22} color="inherit" />
                      ) : (
                        'Accept Offer'
                      )}
                    </Button>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </DashboardContent>
  );
}

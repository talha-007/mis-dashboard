import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function PayoffOfferView() {
  const outstandingAmount = 165000;
  const discountedPayoff = 150000;

  const handleAcceptOffer = () => {
    // Handle accept offer action
    console.log('Offer accepted');
  };

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Payoff Offer
        </Typography>

        <Card sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
              Outstanding
            </Typography>
            <Typography variant="h4">{fCurrency(outstandingAmount)}</Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
              Discounted Payoff
            </Typography>
            <Typography variant="h4">{fCurrency(discountedPayoff)}</Typography>
          </Box>

          <Button fullWidth variant="contained" size="large" onClick={handleAcceptOffer}>
            Accept Offer
          </Button>
        </Card>
      </Container>
    </DashboardContent>
  );
}

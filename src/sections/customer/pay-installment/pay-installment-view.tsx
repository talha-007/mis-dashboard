import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function PayInstallmentView() {
  const payableAmount = 18500;

  const handlePayNow = () => {
    // Handle payment action
    console.log('Payment initiated');
  };

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Pay Installment
        </Typography>

        <Card sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
              Payable Amount
            </Typography>
            <Typography variant="h4">{fCurrency(payableAmount)}</Typography>
          </Box>

          <Button fullWidth variant="contained" size="large" onClick={handlePayNow}>
            Pay Now
          </Button>
        </Card>
      </Container>
    </DashboardContent>
  );
}

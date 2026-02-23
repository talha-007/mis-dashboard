import { toast } from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import loanApplicationService from 'src/redux/services/loan-applications';

// ----------------------------------------------------------------------

interface DueInstallment {
  id: string;
  amount: number;
  dueDate: string;
  isOverdue: boolean;
  loanAmount: number;
  loanApplicationId: string;
  loanDuration: number;
  loanType: string;
  status: string;
}

export function PayInstallmentView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dueInstallment, setDueInstallment] = useState<DueInstallment | null>(null);
  const [success, setSuccess] = useState(false);
  const fetchDueInstallment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await loanApplicationService.getDueInstallment();
        console.log(response);
        
      if (response.status === 200) {
        // dueInstallments is an array - get the first one (or handle multiple)
        const dueInstallments = response.data?.dueInstallments || response.data?.data?.dueInstallments;
        
        if (Array.isArray(dueInstallments) && dueInstallments.length > 0) {
          // Get the first due installment (or you could show all)
          const installment = dueInstallments[0];
          
          setDueInstallment({
            id: installment.id,
            amount: Number(installment.amount || 0),
            dueDate: installment.dueDate,
            isOverdue: installment.isOverdue || false,
            loanAmount: Number(installment.loanAmount || 0),
            loanApplicationId: installment.loanApplicationId,
            loanDuration: Number(installment.loanDuration || 0),
            loanType: installment.loanType || 'N/A',
            status: installment.status || 'due',
          });
        } else {
          setError('No due installment found');
        }
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch due installment';
      setError(errorMessage);
      console.error('Error fetching due installment:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDueInstallment();
  }, [fetchDueInstallment]);

  const handlePayNow = useCallback(async () => {
    // Handle payment action - send installmentId in payload
    if (!dueInstallment?.id) {
      setError('Installment ID is missing');
      return;
    }
    
    const installmentId = dueInstallment.id;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      // Service sends installmentId in payload: { installmentId }
      const response = await loanApplicationService.payInstallment(installmentId);
      console.log(response);
      
      if (response.status === 200) {
        setSuccess(true);
        // Refresh the due installment list after successful payment
        toast.success('Payment successful! Your installment has been paid.');
        await fetchDueInstallment();
      } else {
        setError('Payment failed');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to pay installment';
      setError(errorMessage);
      console.error('Error paying installment:', err);
      // Refresh to get updated status
      await fetchDueInstallment();
    } finally {
      setLoading(false);
    }
  }, [dueInstallment, fetchDueInstallment]);

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Pay Installment
        </Typography>

        {loading ? (
          <Card sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          </Card>
        ) : error ? (
          <Card sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button fullWidth variant="outlined" onClick={fetchDueInstallment}>
              Retry
            </Button>
          </Card>
        ) : dueInstallment ? (
          <Card sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
            {success && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
                Payment successful! Your installment has been paid.
              </Alert>
            )}
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Payable Amount
              </Typography>
              <Typography variant="h4">{fCurrency(dueInstallment.amount)}</Typography>
            </Box>

            {dueInstallment.dueDate && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Due Date
                </Typography>
                <Typography variant="body1">{fDate(dueInstallment.dueDate)}</Typography>
              </Box>
            )}

            {dueInstallment.dueDate && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Status
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: dueInstallment.isOverdue ? 'error.main' : 'warning.main',
                    fontWeight: 500,
                  }}
                >
                  {dueInstallment.isOverdue ? 'Overdue' : 'Due Soon'}
                </Typography>
              </Box>
            )}

            {dueInstallment.loanAmount > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Loan Amount
                </Typography>
                <Typography variant="body1">{fCurrency(dueInstallment.loanAmount)}</Typography>
              </Box>
            )}

            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              onClick={handlePayNow}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </Button>
          </Card>
        ) : (
          <Card sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
            <Alert severity="info">No due installment found.</Alert>
          </Card>
        )}
      </Container>
    </DashboardContent>
  );
}

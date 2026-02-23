import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useParams, useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import borrowerService from 'src/redux/services/borrowServices';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface CustomerInfo {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  cnic: string;
}

interface LoanApplication {
  _id: string;
  amount: number;
  durationMonths: number;
  installmentAmount: number;
  status: string;
}

interface NextInstallment {
  id: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  status: string;
}

interface InstallmentStats {
  nextDueAmount: number;
  nextDueDate: string;
  nextInstallment: NextInstallment;
  overdueAmount: number;
  overdueCount: number;
  overdueInstallments: any[];
  paidInstallments: number;
  totalInstallments: number;
  totalPaid: number;
  totalPending: number;
  totalUpcoming: number;
}

interface BorrowerDetail {
  _id?: string;
  id: string;
  borrowerId: string;
  name: string;
  type: string;
  status: string;
  rating: number;
  loanAmount: number;
  createdAt: string;
  updatedAt: string;
  customerId: CustomerInfo | string;
  loanApplicationId: LoanApplication | string;
  installmentStats?: InstallmentStats;
  recoveryOverdues?: any[];
}

export function BorrowerDetailView() {
  const { id } = useParams();
  const router = useRouter();

  const [borrower, setBorrower] = useState<BorrowerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBorrower = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) {
          setError('Borrower ID not found');
          return;
        }
        const response = await borrowerService.get(id as string);
        console.log(response);
        if (response.status === 200) {
          const data =
            response.data?.data?.borrower ||
            response.data?.borrower ||
            response.data?.data ||
            response.data;
          if (data) {
            setBorrower(data);
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || 'Failed to load borrower');
      } finally {
        setLoading(false);
      }
    };

    fetchBorrower();
  }, [id]);

  const handleBack = () => {
    router.push('/borrower-management');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (!borrower) {
    return (
      <DashboardContent>
        <Alert severity="warning">Borrower not found.</Alert>
        <Button sx={{ mt: 2 }} onClick={handleBack}>
          Back to list
        </Button>
      </DashboardContent>
    );
  }

  // Extract customer info (could be object or string)
  const customerInfo: CustomerInfo | null =
    typeof borrower.customerId === 'object' ? borrower.customerId : null;

  // Extract loan application info (could be object or string)
  const loanApp: LoanApplication | null =
    typeof borrower.loanApplicationId === 'object' ? borrower.loanApplicationId : null;

  return (
    <DashboardContent>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4">Borrower Details</Typography>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={handleBack}
        >
          Back
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Borrower Information */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Borrower Information
          </Typography>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Borrower ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {borrower.borrowerId || borrower.id || borrower._id}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{borrower.name || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body1">{borrower.type || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Label color={getStatusColor(borrower.status)}>
                    {borrower?.status?.toUpperCase()}
                  </Label>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Rating
                </Typography>
                <Typography variant="body1">{borrower.rating || 0}</Typography>
              </Box>
            </Stack>
            <Divider />
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created Date
                </Typography>
                <Typography variant="body2">{fDate(borrower.createdAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2">{fDate(borrower.updatedAt)}</Typography>
              </Box>
            </Stack>
          </Stack>
        </Card>

        {/* Customer Information */}
        {customerInfo && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Customer Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1">
                    {customerInfo.name} {customerInfo.lastname}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    CNIC
                  </Typography>
                  <Typography variant="body1">{customerInfo.cnic || 'N/A'}</Typography>
                </Box>
              </Stack>
              <Divider />
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{customerInfo.email || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">{customerInfo.phone || 'N/A'}</Typography>
                </Box>
              </Stack>
            </Stack>
          </Card>
        )}

        {/* Loan Information */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Loan Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Loan Amount
                </Typography>
                <Typography variant="h6">
                  {fCurrency(borrower.loanAmount || loanApp?.amount || 0)}
                </Typography>
              </Box>
              {loanApp && (
                <>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body1">{loanApp.durationMonths} months</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Monthly Installment
                    </Typography>
                    <Typography variant="body1">{fCurrency(loanApp.installmentAmount)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Loan Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Label color={loanApp.status === 'approved' ? 'success' : 'warning'}>
                        {loanApp?.status?.toUpperCase()}
                      </Label>
                    </Box>
                  </Box>
                </>
              )}
            </Stack>
          </Stack>
        </Card>

        {/* Installment Statistics */}
        {borrower.installmentStats && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Installment Statistics
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              {/* Summary Stats */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Summary
                  </Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Total Installments
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {borrower.installmentStats.totalInstallments}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Paid Installments
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                        {borrower.installmentStats.paidInstallments}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Overdue Count
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
                        {borrower.installmentStats.overdueCount}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>

              {/* Financial Stats */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Financial Overview
                  </Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Total Paid
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                        {fCurrency(borrower.installmentStats.totalPaid)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Total Pending
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'warning.main' }}>
                        {fCurrency(borrower.installmentStats.totalPending)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Total Upcoming
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {fCurrency(borrower.installmentStats.totalUpcoming)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Overdue Amount
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
                        {fCurrency(borrower.installmentStats.overdueAmount)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>

              {/* Next Installment */}
              {borrower.installmentStats.nextInstallment && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Stack spacing={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Next Due Installment
                      </Typography>
                      <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                        <Stack spacing={1.5}>
                          <Stack direction="row" spacing={3} flexWrap="wrap">
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Due Amount
                              </Typography>
                              <Typography variant="h6" sx={{ mt: 0.5 }}>
                                {fCurrency(borrower.installmentStats.nextDueAmount)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Due Date
                              </Typography>
                              <Typography variant="body1" sx={{ mt: 0.5 }}>
                                {fDate(borrower.installmentStats.nextDueDate)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Days Until Due
                              </Typography>
                              <Typography variant="body1" sx={{ mt: 0.5 }}>
                                {borrower.installmentStats.nextInstallment.daysUntilDue} days
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Status
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                <Label
                                  color={
                                    borrower.installmentStats.nextInstallment.status === 'due'
                                      ? 'warning'
                                      : 'default'
                                  }
                                >
                                  {borrower.installmentStats.nextInstallment.status.toUpperCase()}
                                </Label>
                              </Box>
                            </Box>
                          </Stack>
                        </Stack>
                      </Card>
                    </Stack>
                  </Grid>
                </>
              )}

              {/* Overdue Installments */}
              {borrower.installmentStats.overdueInstallments &&
                borrower.installmentStats.overdueInstallments.length > 0 && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Stack spacing={2}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Overdue Installments (
                          {borrower.installmentStats.overdueInstallments.length})
                        </Typography>
                        <Alert severity="error">
                          {borrower.installmentStats.overdueInstallments.length} installment(s) are
                          overdue
                        </Alert>
                      </Stack>
                    </Grid>
                  </>
                )}
            </Grid>
          </Card>
        )}

        {/* Recovery Overdues */}
        {borrower.recoveryOverdues && borrower.recoveryOverdues.length > 0 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recovery Overdues
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Alert severity="warning">
              {borrower.recoveryOverdues.length} recovery overdue record(s) found
            </Alert>
            {/* Add detailed recovery overdues display here if needed */}
          </Card>
        )}
      </Stack>
    </DashboardContent>
  );
}

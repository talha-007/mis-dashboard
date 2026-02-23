import type { CustomerLoanApplication } from 'src/_mock/_customer-loan-application';

import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import loanApplicationService from 'src/redux/services/loan-applications';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

/** Map API loan application to list shape (id, customerName, cnic, city, loanAmount, installmentAmount, status, etc.) */
function mapApiToApplication(item: Record<string, unknown>): CustomerLoanApplication {
  const id = String(item.id ?? item._id ?? '');
  // Handle both 'amount' and 'loanAmount' fields from API
  const loanAmount = Number(item.loanAmount ?? item.amount ?? 0);
  const installmentAmount = Number(item.installmentAmount ?? 0);
  
  // Extract bank info if available (could be object or just ID)
  const bank = item.bank || item.bankId;
  const bankName = typeof bank === 'object' && bank !== null ? String((bank as any).name ?? '') : '';
  
  return {
    id,
    customerName: String(item.customerName ?? item.name ?? ''),
    fatherName: String(item.fatherName ?? ''),
    cnic: String(item.cnic ?? ''),
    city: String(item.city ?? ''),
    region: String(item.region ?? ''),
    loanAmount,
    installmentAmount,
    businessIncome: 0,
    investmentIncome: 0,
    salaryIncome: 0,
    houseRental: 0,
    carRental: 0,
    utilitiesBill: 0,
    installmentsOther: 0,
    fuelExpenses: 0,
    groceryExpenses: 0,
    medicalBills: 0,
    insurance: 0,
    fees: 0,
    otherExpenses: 0,
    miscellaneous: 0,
    status: (item.status as CustomerLoanApplication['status']) ?? 'submitted',
    createdAt: String(item.createdAt ?? item.submittedAt ?? ''),
    updatedAt: String(item.updatedAt ?? ''),
  };
}

export function ApplyLoanView() {
  const router = useRouter();
  const [applications, setApplications] = useState<CustomerLoanApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await loanApplicationService.getCustomerLoanApplications();
      console.log(res);
      
      if (res.status === 200) {
        // Handle different response structures:
        // 1. res.data.data.loanApplications (nested)
        // 2. res.data.loanApplications (direct)
        // 3. res.data (if it's the array directly)
        const responseData = res.data?.data || res.data;
        const loanApplications = responseData?.loanApplications || responseData;
        
        // Ensure we have an array
        const list = Array.isArray(loanApplications) 
          ? loanApplications 
          : (loanApplications?.applications ?? loanApplications?.list ?? []);
        
        // Map each application to the expected shape
        const mapped = (list as Record<string, unknown>[])
          .map(mapApiToApplication)
          .filter((a) => a.id); // Filter out any invalid entries
        
        setApplications(mapped.length ? mapped : []);
      }
    } catch (error) {
      console.error('Error fetching loan applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await loanApplicationService.deleteById(id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch {
      setApplications((prev) => prev.filter((app) => app.id !== id));
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'under_review':
        return 'warning';
      case 'submitted':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Apply for Loan</Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => router.push('/apply-loan/new')}
            >
              New Application
            </Button>
          </Stack>

          {/* Applications Table */}
          <Card>
            {loading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                <CircularProgress />
              </Stack>
            ) : (
              <Scrollbar>
                <TableContainer sx={{ minWidth: 800 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Application ID</TableCell>
                        <TableCell>Customer Name</TableCell>
                        <TableCell>CNIC</TableCell>
                        <TableCell>City</TableCell>
                        <TableCell>Loan Amount</TableCell>
                        <TableCell>Installment Amount</TableCell>
                        <TableCell>Status</TableCell>
                        {/* <TableCell align="right">Actions</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applications.length > 0 ? (
                        applications.map((application) => (
                          <TableRow key={application.id} hover>
                            <TableCell>{application.id}</TableCell>
                            <TableCell>{application.customerName}</TableCell>
                            <TableCell>{application.cnic || 'N/A'}</TableCell>
                            <TableCell>{application.city || 'N/A'}</TableCell>
                            <TableCell>PKR {application.loanAmount.toLocaleString()}</TableCell>
                            <TableCell>
                              PKR {application.installmentAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={application.status.replace('_', ' ').toUpperCase()}
                                color={getStatusColor(application.status) as any}
                                size="small"
                              />
                            </TableCell>
                            {/* <TableCell align="right">
                              <IconButton
                                color="primary"
                                onClick={() => router.push(`/apply-loan/${application.id}`)}
                              >
                                <Iconify icon="eva:edit-fill" />
                              </IconButton>
                              <IconButton color="error" onClick={() => handleDelete(application.id)}>
                                <Iconify icon="eva:trash-2-fill" />
                              </IconButton>
                            </TableCell> */}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              No loan applications found. Click &quot;New Application&quot; to create one.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Scrollbar>
            )}
          </Card>
        </Stack>
      </Container>
    </DashboardContent>
  );
}

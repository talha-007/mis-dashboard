import type { CustomerLoanApplication } from 'src/_mock/_customer-loan-application';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
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
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { useRouter } from 'src/routes/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { _customerLoanApplications } from 'src/_mock/_customer-loan-application';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'customer_loan_applications';

function loadApplications(): CustomerLoanApplication[] {
  if (typeof window === 'undefined') return _customerLoanApplications;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return _customerLoanApplications;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : _customerLoanApplications;
  } catch {
    return _customerLoanApplications;
  }
}

function saveApplications(apps: CustomerLoanApplication[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch {
    // ignore
  }
}

export function ApplyLoanView() {
  const router = useRouter();
  const [applications, setApplications] = useState<CustomerLoanApplication[]>([]);

  useEffect(() => {
    setApplications(loadApplications());
  }, []);

  const handleDelete = (id: string) => {
    setApplications((prev) => {
      const next = prev.filter((app) => app.id !== id);
      saveApplications(next);
      return next;
    });
  };

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
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id} hover>
                        <TableCell>{application.id}</TableCell>
                        <TableCell>{application.customerName}</TableCell>
                        <TableCell>{application.cnic}</TableCell>
                        <TableCell>{application.city}</TableCell>
                        <TableCell>PKR {application.loanAmount.toLocaleString()}</TableCell>
                        <TableCell>PKR {application.installmentAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={application.status.replace('_', ' ').toUpperCase()}
                            color={getStatusColor(application.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => router.push(`/apply-loan/${application.id}`)}
                          >
                            <Iconify icon="eva:edit-fill" />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(application.id)}>
                            <Iconify icon="eva:trash-2-fill" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Card>

        </Stack>
      </Container>
    </DashboardContent>
  );
}

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { customerDashboardStats } from 'src/_mock/_customer-dashboard';

import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export function CustomerDashboardView() {
  const stats = customerDashboardStats;

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Dashboard Overview
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Active Loan */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Active Loan
              </Typography>
              <Typography variant="h3" sx={{ color: '#000' }}>
                {fCurrency(stats.activeLoan.amount)}
              </Typography>
            </Card>
          </Grid>

          {/* Next Installment */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#000', mb: 1 }}>
                Next Installment
              </Typography>
              <Typography variant="h3" sx={{ color: 'warning.main' }}>
                {fCurrency(stats.nextInstallment.amount)}
              </Typography>
            </Card>
          </Grid>

          {/* Due Date */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Due Date
              </Typography>
              <Typography variant="h3" sx={{ color: 'error.main' }}>
                {stats.dueDate}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Loan Details Table */}
        <Card>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }} >
                <TableHead>
                  <TableRow>
                    <TableCell>Total Tenure</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell>Remaining</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {stats.loanDetails.totalTenure}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ color: '#000' }}>
                        {stats.loanDetails.paid}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ color: '#000' }}>
                        {stats.loanDetails.remaining}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ color: '#000' }}>
                        {stats.loanDetails.status}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>
      </Container>
    </DashboardContent>
  );
}

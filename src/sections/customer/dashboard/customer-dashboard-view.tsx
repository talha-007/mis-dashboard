import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import customerService from 'src/redux/services/customer.services';

import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type CustomerStats = {
  activeLoan?: {
    amount: number;
    status: string;
  };
  nextInstallment?: {
    amount: number;
    dueDate: string;
  };
  dueDate?: string;
};

export function CustomerDashboardView() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customerService.getStats();
      if (response.status === 200) {
        const data = response.data?.data || response.data;
        const statsData = data?.stats || {};
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching customer stats:', err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Dashboard Overview
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {loading ? (
            [1, 2, 3].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          ) : stats ? (
            <>
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
                    {stats.activeLoan ? fCurrency(stats.activeLoan.amount) : fCurrency(0)}
                  </Typography>
                  {stats.activeLoan?.status && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      Status: {stats.activeLoan.status}
                    </Typography>
                  )}
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
                    {stats.nextInstallment ? fCurrency(stats.nextInstallment.amount) : fCurrency(0)}
                  </Typography>
                  {stats.nextInstallment?.dueDate && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      Due: {fDate(stats.nextInstallment.dueDate)}
                    </Typography>
                  )}
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
                    {stats.dueDate ? fDate(stats.dueDate) : 'N/A'}
                  </Typography>
                </Card>
              </Grid>
            </>
          ) : (
            <Grid size={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No stats available
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Loan Details Table - Only show if we have active loan data */}
        {stats?.activeLoan && (
          <Card>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Loan Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {fCurrency(stats.activeLoan.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ color: '#000' }}>
                          {stats.activeLoan.status}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Card>
        )}
      </Container>
    </DashboardContent>
  );
}

import type { CreditProposalReport } from 'src/types/assessment.types';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useParams, useNavigate } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import assessmentService from 'src/redux/services/assessment.services';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

export function CreditProposalReportDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<CreditProposalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await assessmentService.getCreditProposalReportById(id);
      setReport(res.data ?? null);
    } catch (err: any) {
      setError(err.message || 'Failed to load report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleApprove = async () => {
    if (!id) return;
    try {
      setProcessing(true);
      await assessmentService.approveLoanApplication(id);
      setReport((prev) => (prev ? { ...prev, status: 'approved' } : null));
    } catch (err: any) {
      setError(err.message || 'Failed to approve');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      setProcessing(true);
      await assessmentService.rejectLoanApplication(id);
      setReport((prev) => (prev ? { ...prev, status: 'rejected' } : null));
    } catch (err: any) {
      setError(err.message || 'Failed to reject');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = () => {
    if (!report) return 'default';
    switch (report.status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'info';
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

  if (!report) {
    return (
      <DashboardContent>
        <Alert severity="warning">Report not found.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/credit-proposal-reports')}>
          Back to list
        </Button>
      </DashboardContent>
    );
  }

  const isPending = report.status === 'pending';

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
        <Typography variant="h4">Credit proposal report</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate('/credit-proposal-reports')}
          >
            Back
          </Button>
          {isPending && (
            <>
              <Button
                variant="contained"
                onClick={handleApprove}
                disabled={processing}
                sx={{ bgcolor: 'grey.800', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}
              >
                Approve loan
              </Button>
              <Button variant="outlined" color="error" onClick={handleReject} disabled={processing}>
                Reject loan
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Customer & application
          </Typography>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Customer
              </Typography>
              <Typography variant="body1">{report.customer?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {report.customer?.email}
              </Typography>
              {report.customer?.phone && (
                <Typography variant="body2" color="text.secondary">
                  {report.customer.phone}
                </Typography>
              )}
            </Box>
            <Divider />
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Score
                </Typography>
                <Typography variant="h6">
                  {report.score} / {report.totalScore}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Loan amount
                </Typography>
                <Typography variant="h6">{fCurrency(report.loanAmount)}</Typography>
              </Box>
              {report.loanType && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Loan type
                  </Typography>
                  <Typography variant="body1">{report.loanType}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Label color={getStatusColor()}>{report.status}</Label>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Submitted
                </Typography>
                <Typography variant="body2">{fDate(report.submittedAt)}</Typography>
              </Box>
            </Stack>
          </Stack>
        </Card>

        {report.answersSnapshot && report.answersSnapshot.length > 0 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Assessment answers (score)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {report.answersSnapshot.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 500 }}>{a.questionText}</TableCell>
                      <TableCell>{a.chosenOptionText}</TableCell>
                      <TableCell align="right">{a.points} pts</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {report.customFieldSnapshot && report.customFieldSnapshot.length > 0 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Income & expenses (customer entered)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {report.customFieldSnapshot.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 500 }}>{c.label}</TableCell>
                      <TableCell>
                        {typeof c.value === 'number' ? c.value.toLocaleString() : c.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Stack>
    </DashboardContent>
  );
}

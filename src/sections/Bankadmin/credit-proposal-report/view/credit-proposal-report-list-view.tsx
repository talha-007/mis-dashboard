import type { CreditProposalReport } from 'src/types/assessment.types';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { useNavigate } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import assessmentService from 'src/redux/services/assessment.services';

import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { CreditProposalReportTableRow } from '../credit-proposal-report-table-row';
import { CreditProposalReportTableHead } from '../credit-proposal-report-table-head';
import { CreditProposalReportTableToolbar } from '../credit-proposal-report-table-toolbar';

const HEAD_LABEL = [
  { id: 'customer', label: 'Customer' },
  { id: 'score', label: 'Score', align: 'center' as const },
  { id: 'loanAmount', label: 'Loan amount' },
  { id: 'submittedAt', label: 'Submitted' },
  // { id: 'status', label: 'Status' },
  { id: 'actions', label: '', align: 'right' as const },
];

export function CreditProposalReportListView() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<CreditProposalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('submittedAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState<any>(null);

  // Map API response to CreditProposalReport type
  const mapApiToReport = useCallback((item: any): CreditProposalReport => {
    // Get loan application data from loanApplications array (first one if available)
    const loanApp = Array.isArray(item.loanApplications) && item.loanApplications.length > 0
      ? item.loanApplications[0]
      : null;
    
    return {
      _id: item.id || item._id || '',
      customerId: item.customer?.id || item.customerId || '',
      customer: {
        _id: item.customer?.id || item.customer?._id || '',
        name: item.customer?.name || 'N/A',
        email: item.customer?.email || 'N/A',
        phone: item.customer?.phone || '',
      },
      assessmentSubmissionId: item.assessment?.id || item.assessmentSubmissionId || '',
      score: item.creditAnalysis?.creditScore || item.creditAnalysis?.rating || item.assessment?.earnedPoints || 0,
      totalScore: item.assessment?.totalPoints || item.assessment?.totalQuestions || 100,
      loanApplicationId: loanApp?.id || loanApp?._id || item.loanApplicationId || '',
      loanAmount: loanApp?.amount || item.creditAnalysis?.recommendations?.maxAmount || 0,
      loanType: loanApp?.loanType || loanApp?.type || '',
      loanPurpose: loanApp?.loanPurpose || loanApp?.purpose || '',
      status: (loanApp?.status || item.status || 'pending') as CreditProposalReport['status'],
      submittedAt: loanApp?.submittedAt || loanApp?.createdAt || item.submittedAt || item.createdAt || new Date().toISOString(),
      answersSnapshot: item.answersSnapshot || [],
      customFieldSnapshot: item.customFieldSnapshot || [],
    };
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
      };
      
      // Add search parameter if filterName is provided
      if (filterName.trim()) {
        params.search = filterName.trim();
      }
      
      // Add sorting parameters
      if (orderBy === 'score' || orderBy === 'creditScore') {
        params.sortBy = 'creditScore';
        params.sortOrder = order;
      } else if (orderBy === 'submittedAt') {
        params.sortBy = 'submittedAt';
        params.sortOrder = order;
      }
      
      const response = await assessmentService.getCreditProposalReports(params);
      console.log('response', response);
      
      if (response.status === 200) {
        // Extract data from response - reports, pagination, and summary are at response.data level
        // Structure: { message, pagination: {...}, reports: [...], summary: {...} }
        const responseData = response.data?.data || response.data;
        const reportsList = responseData?.reports || [];
        
        // Map API response to CreditProposalReport type
        const mapped = Array.isArray(reportsList)
          ? reportsList.map(mapApiToReport).filter((item) => item._id)
          : [];
        
        setReports(mapped);
        
        // Set pagination info from server response
        const pagination = responseData?.pagination || {};
        setTotalCount(pagination.total || mapped.length);
        
        // Set summary if available
        if (responseData?.summary) {
          setSummary(responseData.summary);
        }
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load reports';
      setError(errorMessage);
      setReports([]);
      setTotalCount(0);
      console.error('Error fetching credit proposal reports:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filterName, orderBy, order, mapApiToReport]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [successMessage]);

  // Server-side sorting: changing sort triggers new API call
  const handleSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrderBy(id);
      setOrder(isAsc ? 'desc' : 'asc');
      setPage(0); // Reset to first page when sorting
      // fetchReports will be called automatically via useEffect dependency
    },
    [orderBy, order]
  );

  const handleSelectAllRows = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelected(reports.map((r) => r._id));
        return;
      }
      setSelected([]);
    },
    [reports]
  );

  const handleSelectRow = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }, []);

  const handleView = useCallback(
    (id: string) => navigate(`/credit-proposal-reports/${id}`),
    [navigate]
  );

  const handleApprove = useCallback(async (id: string) => {
    try {
      const response = await assessmentService.approveLoanApplication(id);
      if (response.status === 200) {
        setSuccessMessage('Loan application approved.');
        // Refresh the reports list to get updated data
        await fetchReports();
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to approve';
      setError(errorMessage);
    }
  }, [fetchReports]);

  const handleReject = useCallback(async (id: string) => {
    try {
      const response = await assessmentService.rejectLoanApplication(id);
      if (response.status === 200) {
        setSuccessMessage('Loan application rejected.');
        // Refresh the reports list to get updated data
        await fetchReports();
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to reject';
      setError(errorMessage);
    }
  }, [fetchReports]);

  // Client-side filtering removed since we're using server-side search
  const dataFiltered = reports;
  const notFound = !dataFiltered.length && !!filterName && !loading;

  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Credit proposal reports
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Card>
        <CreditProposalReportTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={(e) => {
            setFilterName(e.target.value);
            setPage(0); // Reset to first page when searching
            // fetchReports will be called automatically via useEffect dependency
          }}
        />
        
        {summary && (
          <Box sx={{ p: 2, bgcolor: 'background.neutral', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Summary: {summary.totalReports} reports | Average Score: {summary.averageCreditScore?.toFixed(1) || 'N/A'}
            </Typography>
          </Box>
        )}
        
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <CreditProposalReportTableHead
                order={order}
                orderBy={orderBy}
                rowCount={reports.length}
                numSelected={selected.length}
                onSort={handleSort}
                // onSelectAllRows={handleSelectAllRows}
                headLabel={HEAD_LABEL}
              />
              <TableBody>
                {dataFiltered.length > 0 ? (
                  dataFiltered.map((row) => (
                    <CreditProposalReportTableRow
                      key={row._id}
                      row={row}
                      selected={selected.includes(row._id)}
                      // onSelectRow={() => handleSelectRow(row._id)}
                      onView={handleView}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        {notFound ? `No reports found for "${filterName}"` : 'No reports found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        
        {/* Server-side pagination: count is total from server, not current page items */}
        <TablePagination
          component="div"
          page={page}
          count={totalCount} // Total count from server (all pages)
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)} // Triggers server request for new page
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0); // Reset to first page when changing rows per page
            // fetchReports will be called automatically via useEffect dependency
          }}
        />
      </Card>
    </DashboardContent>
  );
}

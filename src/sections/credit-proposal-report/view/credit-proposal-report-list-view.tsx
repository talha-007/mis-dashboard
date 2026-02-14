import type { CreditProposalReport } from 'src/types/assessment.types';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
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
import { TableEmptyRows } from '../table-empty-rows';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { CreditProposalReportTableRow } from '../credit-proposal-report-table-row';
import { CreditProposalReportTableHead } from '../credit-proposal-report-table-head';
import { CreditProposalReportTableToolbar } from '../credit-proposal-report-table-toolbar';

const HEAD_LABEL = [
  { id: 'customer', label: 'Customer' },
  { id: 'score', label: 'Score', align: 'center' as const },
  { id: 'loanAmount', label: 'Loan amount' },
  { id: 'submittedAt', label: 'Submitted' },
  { id: 'status', label: 'Status' },
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

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await assessmentService.getCreditProposalReports({
        page: page + 1,
        limit: rowsPerPage,
      });
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

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

  const handleSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrderBy(id);
      setOrder(isAsc ? 'desc' : 'asc');
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
      await assessmentService.approveLoanApplication(id);
      setSuccessMessage('Loan application approved.');
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: 'approved' as const } : r))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to approve');
    }
  }, []);

  const handleReject = useCallback(async (id: string) => {
    try {
      await assessmentService.rejectLoanApplication(id);
      setSuccessMessage('Loan application rejected.');
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: 'rejected' as const } : r))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to reject');
    }
  }, []);

  const dataFiltered = applyFilter({
    inputData: reports,
    comparator: getComparator(order, orderBy as keyof CreditProposalReport),
    filterName,
  });
  const notFound = !dataFiltered.length && !!filterName;

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
            setPage(0);
          }}
        />
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <CreditProposalReportTableHead
                order={order}
                orderBy={orderBy}
                rowCount={reports.length}
                numSelected={selected.length}
                onSort={handleSort}
                onSelectAllRows={handleSelectAllRows}
                headLabel={HEAD_LABEL}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <CreditProposalReportTableRow
                      key={row._id}
                      row={row}
                      selected={selected.includes(row._id)}
                      onSelectRow={() => handleSelectRow(row._id)}
                      onView={handleView}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(page, rowsPerPage, dataFiltered.length)}
                />
                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination
          component="div"
          page={page}
          count={dataFiltered.length}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>
    </DashboardContent>
  );
}

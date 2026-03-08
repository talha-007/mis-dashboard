import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import loanApplicationService from 'src/redux/services/loan-applications';

import { Scrollbar } from 'src/components/scrollbar';

import { emptyRows } from '../utils';
import { TableNoData } from '../table-no-data';
import { TableEmptyRows } from '../table-empty-rows';
import { LoanApplicationTableRow } from '../loan-application-table-row';
import { LoanApplicationTableHead } from '../loan-application-table-head';
import { LoanApplicationTableToolbar } from '../loan-application-table-toolbar';

import type { LoanApplicationProps } from '../loan-application-table-row';

// ----------------------------------------------------------------------
// Map API loan application (loanApplications[] item) to table row shape
function mapApiToRow(app: Record<string, any>): LoanApplicationProps {
  const customerId = app.customerId && typeof app.customerId === 'object' ? app.customerId : null;
  const name =
    app.customerName ||
    (customerId ? [customerId.name, customerId.lastname].filter(Boolean).join(' ').trim() : '') ||
    '—';
  return {
    id: String(app._id ?? app.id ?? ''),
    applicantName: name,
    applicantId: customerId?._id ?? app.customerId ?? '',
    cnic: app.cnic ?? '—',
    phone: customerId?.phone ?? app.phone ?? '—',
    email: customerId?.email ?? app.email ?? '—',
    amount: Number(app.amount ?? 0),
    durationMonths: app.durationMonths != null ? Number(app.durationMonths) : undefined,
    score: Number(app.score ?? app.eligibility?.creditScore ?? 0),
    status: (app.status === 'submitted'
      ? 'submitted'
      : app.status) as LoanApplicationProps['status'],
    appliedDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—',
    reviewedBy: app.reviewedBy ?? null,
    reviewedDate: app.reviewedDate ?? null,
  };
}

export function LoanApplicationView() {
  const table = useTable();

  const [filterName, setFilterName] = useState('');
  const [applications, setApplications] = useState<LoanApplicationProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectInProgress, setRejectInProgress] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await loanApplicationService.list({
        page: table.page + 1,
        limit: table.rowsPerPage,
      });

      const data = response.data?.data ?? response.data;
      const loanApplications = data?.loanApplications ?? [];
      const pagination = data?.pagination;

      setApplications(loanApplications.map(mapApiToRow));
      setTotalCount(pagination?.total ?? loanApplications.length);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load applications');
      setApplications([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = useCallback(
    async (id: string) => {
      try {
        await loanApplicationService.updateStatus(id, { status: 'approved' });
        const response = await loanApplicationService.list({
          page: table.page + 1,
          limit: table.rowsPerPage,
        });
        const data = response.data?.data ?? response.data;
        const loanApplications = data?.loanApplications ?? [];
        setApplications(loanApplications.map(mapApiToRow));
        setTotalCount(data?.pagination?.total ?? loanApplications.length);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to approve application');
      }
    },
    [table.page, table.rowsPerPage]
  );

  const handleReject = useCallback((id: string) => {
    setSelectedRejectId(id);
    setRejectReason('');
    setRejectDialogOpen(true);
  }, []);

  const handleCloseRejectDialog = () => {
    if (rejectInProgress) return;
    setRejectDialogOpen(false);
    setSelectedRejectId(null);
    setRejectReason('');
  };

  const handleConfirmReject = useCallback(async () => {
    if (!selectedRejectId) return;

    if (!rejectReason.trim()) {
      setError('Rejection reason is required when rejecting a loan application');
      return;
    }

    try {
      setRejectInProgress(true);
      await loanApplicationService.updateStatus(selectedRejectId, {
        status: 'rejected',
        rejectionReason: rejectReason.trim(),
      });

      // Refresh the list by refetching
      const response = await loanApplicationService.list({
        page: table.page + 1,
        limit: table.rowsPerPage,
      });
      const data = response.data?.data ?? response.data;
      const loanApplications = data?.loanApplications ?? [];
      setApplications(loanApplications.map(mapApiToRow));
      setTotalCount(data?.pagination?.total ?? loanApplications.length);

      setRejectDialogOpen(false);
      setSelectedRejectId(null);
      setRejectReason('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to reject application');
    } finally {
      setRejectInProgress(false);
    }
  }, [selectedRejectId, rejectReason, table.page, table.rowsPerPage]);

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Loan Applications
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Card
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading applications...
            </Typography>
          </Stack>
        </Card>
      ) : (
        <Card>
          <LoanApplicationTableToolbar
            numSelected={table.selected.length}
            filterName={filterName}
            onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
              setFilterName(event.target.value);
              table.onResetPage();
            }}
            onReload={fetchApplications}
          />

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <LoanApplicationTableHead
                  order={table.order}
                  orderBy={table.orderBy}
                  rowCount={applications.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  // onSelectAllRows={(checked) =>
                  //   table.onSelectAllRows(
                  //     checked,
                  //     applications.map((application) => application.id)
                  //   )
                  // }
                  headLabel={[
                    { id: 'applicantName', label: 'Applicant' },
                    { id: 'amount', label: 'Amount' },
                    { id: 'durationMonths', label: 'Duration', align: 'center' },
                    { id: 'score', label: 'Score', align: 'center' },
                    { id: 'status', label: 'Status' },
                    { id: 'decision', label: 'Decision', align: 'right' },
                  ]}
                />
                <TableBody>
                  {applications.length > 0 ? (
                    applications.map((row) => (
                      <LoanApplicationTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        // onSelectRow={() => table.onSelectRow(row.id)}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          {filterName
                            ? `No loan applications found for "${filterName}"`
                            : 'No loan applications found'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {applications.length > 0 && (
                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, applications.length)}
                    />
                  )}

                  {filterName && !applications.length && !loading && (
                    <TableNoData searchQuery={filterName} />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            component="div"
            page={table.page}
            count={totalCount}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      )}

      {/* Reject Confirmation Dialog (List View) */}
      <Dialog open={rejectDialogOpen} onClose={handleCloseRejectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Application</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Typography variant="body2">
              Are you sure you want to reject this loan application?
            </Typography>
            <TextField
              fullWidth
              required
              multiline
              rows={3}
              label="Rejection Reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog} disabled={rejectInProgress}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReject}
            disabled={rejectInProgress}
            variant="contained"
            color="error"
            startIcon={rejectInProgress ? <CircularProgress size={20} /> : undefined}
          >
            {rejectInProgress ? 'Processing...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('appliedDate');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}

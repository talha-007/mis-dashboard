import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
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

export function LoanApplicationView() {
  const table = useTable();

  const [filterName, setFilterName] = useState('');
  const [applications, setApplications] = useState<LoanApplicationProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch loan applications on component mount and when pagination/filter changes
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await loanApplicationService.list({
          page: table.page + 1,
          limit: table.rowsPerPage,
        });

        if (response.status === 200) {
          const loanApplications = response.data?.loanApplications || [];
          const pagination = response.data?.pagination;

          // Transform API response to match LoanApplicationProps
          const transformedApps: LoanApplicationProps[] = loanApplications.map((app: any) => ({
            id: app._id,
            applicantName:
              app.customerName || `${app.name || ''} ${app.lastname || ''}`.trim() || 'N/A',
            applicantId: app.customerId || '',
            cnic: app.cnic || 'N/A',
            phone: app.phone || 'N/A',
            email: app.email || 'N/A',
            amount: app.amount || 0,
            loanType: '', // Not in API response, can be added later
            score: app.assessment?.score || 0, // Score might come from assessment if available
            status: (app.status === 'submitted'
              ? 'submitted'
              : app.status) as LoanApplicationProps['status'],
            appliedDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A',
            reviewedBy: app.reviewedBy || null,
            reviewedDate: app.reviewedDate || null,
          }));

          setApplications(transformedApps);
          setTotalCount(pagination?.total || transformedApps.length);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || 'Failed to load applications');
        setApplications([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [table.page, table.rowsPerPage]);

  const handleApprove = useCallback(
    async (id: string) => {
      try {
        await loanApplicationService.updateStatus(id, { status: 'approved' });
        // Refresh the list by refetching
        const response = await loanApplicationService.list({
          page: table.page + 1,
          limit: table.rowsPerPage,
        });
        if (response.status === 200) {
          const loanApplications = response.data?.loanApplications || [];
          const pagination = response.data?.pagination;
          const transformedApps: LoanApplicationProps[] = loanApplications.map((app: any) => ({
            id: app._id || app.id || '',
            applicantName:
              app.customerName || `${app.name || ''} ${app.lastname || ''}`.trim() || 'N/A',
            applicantId: app.customerId || '',
            cnic: app.cnic || 'N/A',
            phone: app.phone || 'N/A',
            email: app.email || 'N/A',
            amount: app.amount || 0,
            loanType: '',
            score: app.assessment?.score || 0,
            status: (app.status === 'submitted'
              ? 'submitted'
              : app.status) as LoanApplicationProps['status'],
            appliedDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A',
            reviewedBy: app.reviewedBy || null,
            reviewedDate: app.reviewedDate || null,
          }));
          setApplications(transformedApps);
          setTotalCount(pagination?.total || transformedApps.length);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to approve application');
      }
    },
    [table.page, table.rowsPerPage]
  );

  const handleReject = useCallback(
    async (id: string) => {
      try {
        await loanApplicationService.updateStatus(id, { status: 'rejected' });
        // Refresh the list by refetching
        const response = await loanApplicationService.list({
          page: table.page + 1,
          limit: table.rowsPerPage,
        });
        if (response.status === 200) {
          const loanApplications = response.data?.loanApplications || [];
          const pagination = response.data?.pagination;
          const transformedApps: LoanApplicationProps[] = loanApplications.map((app: any) => ({
            id: app._id || app.id || '',
            applicantName:
              app.customerName || `${app.name || ''} ${app.lastname || ''}`.trim() || 'N/A',
            applicantId: app.customerId || '',
            cnic: app.cnic || 'N/A',
            phone: app.phone || 'N/A',
            email: app.email || 'N/A',
            amount: app.amount || 0,
            loanType: '',
            score: app.assessment?.score || 0,
            status: (app.status === 'submitted'
              ? 'submitted'
              : app.status) as LoanApplicationProps['status'],
            appliedDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A',
            reviewedBy: app.reviewedBy || null,
            reviewedDate: app.reviewedDate || null,
          }));
          setApplications(transformedApps);
          setTotalCount(pagination?.total || transformedApps.length);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to reject application');
      }
    },
    [table.page, table.rowsPerPage]
  );

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
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          {filterName ? `No loan applications found for "${filterName}"` : 'No loan applications found'}
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

                  {filterName && !applications.length && !loading && <TableNoData searchQuery={filterName} />}
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

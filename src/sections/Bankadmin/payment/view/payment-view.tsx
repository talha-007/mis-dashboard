import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import bankAdminService from 'src/redux/services/bank-admin.services';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { PaymentTableRow } from '../payment-table-row';
import { PaymentTableHead } from '../payment-table-head';
import { PaymentTableToolbar } from '../payment-table-toolbar';

// ----------------------------------------------------------------------

export function PaymentView() {
  const table = useTable();

  const [filterName, setFilterName] = useState('');
  const [payments, setPayments] = useState<
    { id: string; date: string; borrower: string; amount: number; status: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [paymentType, setPaymentType] = useState<'all' | 'recovery' | 'penalty' | 'fee'>('all');
  const [summary, setSummary] = useState<any>(null);

  // Map API response to PaymentProps type
  // API structure: { id, amount, customerName, date, description, paymentType, status, subType, type }
  const mapApiToPayment = useCallback((item: any) => ({
      id: item.id || item._id || '',
      date: item.date || item.paymentDate || item.createdAt || new Date().toISOString(),
      borrower: item.customerName || item.borrowerName || item.borrower || 'N/A',
      amount: Number(item.amount || 0), // Can be negative for refunds
      status: item.status || 'pending',
    }), []);

  // Fetch payments from API
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        type: 'borrower_ledgers',
        page: table.page + 1,
        limit: table.rowsPerPage,
      };
      
      // Add payment type filter if not 'all'
      if (paymentType !== 'all') {
        params.paymentType = paymentType;
      }
      
      // Add search parameter if filterName is provided
      if (filterName.trim()) {
        params.search = filterName.trim();
      }
      
      const response = await bankAdminService.getAllPayments(params);
      console.log(response);
      
      if (response.status === 200) {
        // Extract data from response - payments, pagination, and summary are at response.data level
        // Structure: { message, payments: [...], pagination: {...}, summary: {...}, filters: {...} }
        const data = response.data?.data || response.data;
        const paymentsList = data?.payments || [];
        
        // Map API response to PaymentProps type
        const mapped = Array.isArray(paymentsList)
          ? paymentsList.map(mapApiToPayment).filter((item) => item.id)
          : [];
        
        setPayments(mapped);
        
        // Set pagination info from server response
        const pagination = data?.pagination || {};
        setTotalCount(pagination.total || mapped.length);
        
        // Set summary if available
        if (data?.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load payments';
      setError(errorMessage);
      setPayments([]);
      setTotalCount(0);
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, paymentType, filterName, mapApiToPayment]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Client-side filtering removed since we're using server-side search
  const dataFiltered = payments;
  const notFound = !dataFiltered.length && !!filterName && !loading;

  const handlePaymentTypeChange = useCallback((_event: React.SyntheticEvent, newValue: 'all' | 'recovery' | 'penalty' | 'fee') => {
    setPaymentType(newValue);
    table.onResetPage(); // Reset to first page when changing type
  }, [table]);

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Payments & Ledger
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          New Payment
        </Button>
      </Box>

      <Card>
        <PaymentTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage(); // Reset to first page when searching
            // fetchPayments will be called automatically via useEffect dependency
          }}
        />

        {/* Payment Type Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={paymentType} onChange={handlePaymentTypeChange}>
            <Tab label="All" value="all" />
            <Tab label="Recovery" value="recovery" />
            <Tab label="Penalty" value="penalty" />
            <Tab label="Fee" value="fee" />
          </Tabs>
        </Box>

        {/* Summary Display */}
        {summary && (
          <Box sx={{ p: 2, bgcolor: 'background.neutral', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Summary
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                Total Payments: <strong>{summary.totalPayments || 0}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recovery: <strong>{summary.recoveryPaymentsCount || 0}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Penalty: <strong>{summary.penaltyPaymentsCount || 0}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fee: <strong>{summary.feePaymentsCount || 0}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Amount: <strong>{fCurrency(Math.abs(summary.totalAmount || 0))}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed: <strong style={{ color: 'success.main' }}>{summary.completedCount || 0}</strong>
              </Typography>
              {summary.pendingCount > 0 && (
                <Typography variant="body2" color="warning.main">
                  Pending: <strong>{summary.pendingCount}</strong>
                </Typography>
              )}
              {summary.failedCount > 0 && (
                <Typography variant="body2" color="error.main">
                  Failed: <strong>{summary.failedCount}</strong>
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <PaymentTableHead
                    order={table.order}
                    orderBy={table.orderBy}
                    rowCount={payments.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    headLabel={[
                      { id: 'date', label: 'Date' },
                      { id: 'borrower', label: 'Borrower' },
                      { id: 'amount', label: 'Amount' },
                      { id: 'status', label: 'Status' },
                      { id: '', label: '' },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered.length > 0 ? (
                      dataFiltered.map((row) => (
                        <PaymentTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            {notFound ? `No payments found for "${filterName}"` : 'No payments found'}
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
              page={table.page}
              count={totalCount} // Total count from server (all pages)
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage} // Triggers server request for new page
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={table.onChangeRowsPerPage} // Triggers server request with new limit
            />
          </>
        )}
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('date');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

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

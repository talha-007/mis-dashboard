import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
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

import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { RecoveryTableRow } from '../recovery-table-row';
import { RecoveryTableHead } from '../recovery-table-head';
import { RecoveryTableToolbar } from '../recovery-table-toolbar';

import type { RecoveryProps } from '../recovery-table-row';

// ----------------------------------------------------------------------

export function RecoveryView() {
  const table = useTable();

  const [filterName, setFilterName] = useState('');
  const [recoveries, setRecoveries] = useState<RecoveryProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [typeFilter, setTypeFilter] = useState<'all' | 'overdues' | 'dues'>('all');
  const [summary, setSummary] = useState<any>(null);

  // Map API response to RecoveryProps type
  // API structure: { id, amount, customerCnic, customerEmail, customerName, daysLate, dueDate, isOverdue, loanAmount, loanType, status, urgencyLevel }
  const mapApiToRecovery = useCallback((item: any): RecoveryProps => {
    const daysLate = Number(item.daysLate || 0);
    const isOverdue = item.isOverdue || daysLate > 0;

    // Determine status based on API status and isOverdue flag
    let status: 'overdue' | 'recovered' | 'defaulted' = 'overdue';
    if (item.status === 'recovered' || item.status === 'paid') {
      status = 'recovered';
    } else if (item.status === 'defaulted' || daysLate >= 90) {
      status = 'defaulted';
    } else if (isOverdue || daysLate > 0) {
      status = 'overdue';
    } else if (item.status === 'due') {
      // If status is 'due' and not overdue, it's still considered 'overdue' for display purposes
      status = 'overdue';
    }

    return {
      id: item.id || item._id || '',
      borrowerId: item.borrowerId || item.customerId || '',
      borrowerName: item.customerName || 'N/A',
      cnic: item.customerCnic || 'N/A',
      phone: item.customerPhone || item.phone || 'N/A',
      email: item.customerEmail || 'N/A',
      loanId: item.loanId || item.loanApplicationId || '',
      loanAmount: Number(item.loanAmount || 0),
      dueAmount: Number(item.amount || 0),
      daysLate,
      dueDate: item.dueDate || '',
      lastPaymentDate: item.lastPaymentDate || item.lastPayment || '',
      status,
      isDefaulter: item.isDefaulter || status === 'defaulted' || false,
    };
  }, []);

  // Fetch recovery overview from API
  const fetchRecoveries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: table.page + 1,
        limit: table.rowsPerPage,
      };

      // Add type filter if not 'all'
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      // Add search parameter if filterName is provided
      if (filterName.trim()) {
        params.search = filterName.trim();
      }
      const response = await bankAdminService.getRecoveryOverview(params);
      if (response.status === 200) {
        const data = response.data?.data || response.data;
        const installmentsList = data?.installments || [];
        // Map API response to RecoveryProps type
        const mapped = Array.isArray(installmentsList)
          ? installmentsList.map(mapApiToRecovery).filter((item) => item.id)
          : [];
        setRecoveries(mapped);
        // Set pagination info from server response
        const pagination = data?.pagination || {};
        setTotalCount(pagination.total || mapped.length);
        // Set summary if available
        if (data?.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to load recoveries';
      setError(errorMessage);
      setRecoveries([]);
      setTotalCount(0);
      console.error('Error fetching recovery overview:', err);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, typeFilter, filterName, mapApiToRecovery]);

  useEffect(() => {
    fetchRecoveries();
  }, [fetchRecoveries]);

  // Client-side filtering removed since we're using server-side search
  const dataFiltered = recoveries;
  const notFound = !dataFiltered.length && !!filterName && !loading;

  const handleMarkDefaulter = useCallback(
    async (id: string) => {
      // TODO: Implement API call to mark as defaulter
      setRecoveries((prev) =>
        prev.map((recovery) =>
          recovery.id === id
            ? {
                ...recovery,
                isDefaulter: true,
                status: 'defaulted' as const,
              }
            : recovery
        )
      );
      // Refresh data after marking as defaulter
      await fetchRecoveries();
    },
    [fetchRecoveries]
  );

  const handleTypeChange = useCallback(
    (_event: React.SyntheticEvent, newValue: 'all' | 'overdues' | 'dues') => {
      setTypeFilter(newValue);
      table.onResetPage(); // Reset to first page when changing type
    },
    [table]
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
          Recoveries & Overdues
        </Typography>
      </Box>

      <Card>
        <RecoveryTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage(); // Reset to first page when searching
            // fetchRecoveries will be called automatically via useEffect dependency
          }}
        />

        {/* Type Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={typeFilter} onChange={handleTypeChange}>
            <Tab label="All" value="all" />
            <Tab label="Overdues" value="overdues" />
            <Tab label="Dues" value="dues" />
          </Tabs>
        </Box>

        {/* Summary Display */}
        {summary && (
          <Box
            sx={{ p: 2, bgcolor: 'background.neutral', borderBottom: 1, borderColor: 'divider' }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Summary
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                Total Dues: <strong>{summary.totalDues || summary.duesCount || 0}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdues:{' '}
                <strong style={{ color: 'error.main' }}>{summary.overduesCount || 0}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Due Amount: <strong>{fCurrency(summary.totalDueAmount || 0)}</strong>
              </Typography>
              {summary.urgentOverdues > 0 && (
                <Typography variant="body2" color="error.main">
                  Urgent Overdues: <strong>{summary.urgentOverdues}</strong>
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
                  <RecoveryTableHead
                    order={table.order}
                    orderBy={table.orderBy}
                    rowCount={recoveries.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    // onSelectAllRows={(checked) =>
                    //   table.onSelectAllRows(
                    //     checked,
                    //     recoveries.map((recovery) => recovery.id)
                    //   )
                    // }
                    headLabel={[
                      { id: 'borrowerName', label: 'Borrower' },
                      { id: 'dueAmount', label: 'Due' },
                      { id: 'dueDate', label: 'Due Date' },
                      { id: 'daysLate', label: 'Days Late', align: 'center' },
                      { id: 'action', label: 'Action', align: 'right' },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered.length > 0 ? (
                      dataFiltered.map((row) => (
                        <RecoveryTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          // onSelectRow={() => table.onSelectRow(row.id)}
                          onMarkDefaulter={handleMarkDefaulter}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            {notFound
                              ? `No recoveries found for "${filterName}"`
                              : 'No recoveries found'}
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

function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('daysLate');
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

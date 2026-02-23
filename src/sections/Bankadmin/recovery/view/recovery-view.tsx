import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

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

  // Map API response to RecoveryProps type
  const mapApiToRecovery = useCallback((item: any): RecoveryProps => {
    // Calculate days late from dueDate
    const calculateDaysLate = (dueDateStr: string): number => {
      if (!dueDateStr) return 0;
      const dueDate = new Date(dueDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    };

    const dueDate = item.dueDate || item.installment?.dueDate || '';
    const daysLate = item.daysLate || item.daysOverdue || calculateDaysLate(dueDate);
    
    // Determine status based on daysLate
    let status: 'overdue' | 'recovered' | 'defaulted' = 'overdue';
    if (item.status === 'recovered' || item.status === 'paid') {
      status = 'recovered';
    } else if (item.status === 'defaulted' || item.isDefaulter || daysLate >= 90) {
      status = 'defaulted';
    } else if (daysLate > 0) {
      status = 'overdue';
    }

    return {
      id: item.id || item._id || item.installmentId || '',
      borrowerId: item.borrowerId || item.borrower?.id || item.customerId || '',
      borrowerName: item.borrowerName || item.borrower?.name || item.customer?.name || 'N/A',
      cnic: item.cnic || item.borrower?.cnic || item.customer?.cnic || 'N/A',
      phone: item.phone || item.borrower?.phone || item.customer?.phone || 'N/A',
      email: item.email || item.borrower?.email || item.customer?.email || 'N/A',
      loanId: item.loanId || item.loanApplicationId || item.loan?.id || '',
      loanAmount: Number(item.loanAmount || item.loan?.amount || 0),
      dueAmount: Number(item.dueAmount || item.amount || item.installment?.amount || 0),
      daysLate,
      dueDate,
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
        const recoveriesList = data?.recoveries || data?.overdues || data?.dues || data || [];
        
        // Map API response to RecoveryProps type
        const mapped = Array.isArray(recoveriesList)
          ? recoveriesList.map(mapApiToRecovery).filter((item) => item.id)
          : [];
        
        setRecoveries(mapped);
        
        // Set pagination info from server response
        const pagination = data?.pagination || {};
        setTotalCount(pagination.total || mapped.length);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load recoveries';
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

  const handleMarkDefaulter = useCallback(async (id: string) => {
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
  }, [fetchRecoveries]);

  const handleTypeChange = useCallback((_event: React.SyntheticEvent, newValue: 'all' | 'overdues' | 'dues') => {
    setTypeFilter(newValue);
    table.onResetPage(); // Reset to first page when changing type
  }, [table]);

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
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        recoveries.map((recovery) => recovery.id)
                      )
                    }
                    headLabel={[
                      { id: 'borrowerName', label: 'Borrower' },
                      { id: 'dueAmount', label: 'Due' },
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
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onMarkDefaulter={handleMarkDefaulter}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            {notFound ? `No recoveries found for "${filterName}"` : 'No recoveries found'}
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

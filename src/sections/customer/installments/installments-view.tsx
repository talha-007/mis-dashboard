import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import loanApplicationService from 'src/redux/services/loan-applications';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { InstallmentTableRow } from './installment-table-row';
import { InstallmentTableHead } from './installment-table-head';
import { InstallmentTableToolbar } from './installment-table-toolbar';

// ----------------------------------------------------------------------

export function InstallmentsView() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState('month');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [installments, setInstallments] = useState<import('src/_mock/_installment').Installment[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Map API response to Installment type
  const mapApiToInstallment = useCallback((item: any): import('src/_mock/_installment').Installment => {
    return {
      id: String(item.id || item._id || ''),
      month: item.month || item.monthName || new Date(item.dueDate || item.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }),
      amount: Number(item.amount || 0),
      status: item.status || 'pending',
      dueDate: item.dueDate || item.createdAt || '',
    };
  }, []);

  // Fetch installment history from API
  const fetchInstallments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: page + 1, // Convert 0-based to 1-based for server
        limit: rowsPerPage,
      };
      
      // Add search parameter if filterName is provided
      if (filterName.trim()) {
        params.search = filterName.trim();
      }
      
      const response = await loanApplicationService.getInstallmentHistory(params);
      
      if (response.status === 200) {
        const data = response.data?.data || response.data;
        const installmentsList = data?.installments || data?.history || data || [];
        
        // Map API response to Installment type
        const mapped = Array.isArray(installmentsList)
          ? installmentsList.map(mapApiToInstallment).filter((item) => item.id)
          : [];
        
        setInstallments(mapped);
        
        // Set pagination info from server response
        const pagination = data?.pagination || {};
        setTotalCount(pagination.total || mapped.length);
        setTotalPages(pagination.totalPages || 1);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch installment history';
      setError(errorMessage);
      setInstallments([]);
      setTotalCount(0);
      console.error('Error fetching installment history:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filterName, mapApiToInstallment]);

  useEffect(() => {
    fetchInstallments();
  }, [fetchInstallments]);

  // Client-side filtering is removed since we're using server-side search
  const dataFiltered = installments;

  const notFound = !dataFiltered.length && !!filterName && !loading;

  const handleSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const handleSelectAllRows = useCallback((checked: boolean) => {
    if (checked) {
      const newSelecteds = installments.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const handleSelectRow = useCallback(
    (id: string) => {
      const selectedIndex = selected.indexOf(id);
      let newSelected: string[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }

      setSelected(newSelected);
    },
    [selected]
  );

  // Server-side pagination: changing page triggers new API call
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
    // fetchInstallments will be called automatically via useEffect dependency
  }, []);

  // Server-side pagination: changing rows per page resets to first page and triggers new API call
  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
    // fetchInstallments will be called automatically via useEffect dependency
  }, []);

  // Server-side search: changing filter resets to first page and triggers new API call
  const handleFilterByName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
    setPage(0); // Reset to first page when searching
    // fetchInstallments will be called automatically via useEffect dependency
  }, []);

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Box display="flex" alignItems="center" mb={5}>
          <Typography variant="h4" flexGrow={1}>
            Installment History
          </Typography>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Pay Now
          </Button>
        </Box>

        <Card>
          <InstallmentTableToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
          />

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
                    <InstallmentTableHead
                      order={order}
                      orderBy={orderBy}
                      rowCount={installments.length}
                      numSelected={selected.length}
                      onSort={handleSort}
                      onSelectAllRows={handleSelectAllRows}
                      headLabel={[
                        { id: 'month', label: 'Month' },
                        { id: 'amount', label: 'Amount' },
                        { id: 'status', label: 'Status' },
                        { id: 'dueDate', label: 'Due Date' },
                      ]}
                    />
                    <TableBody>
                      {dataFiltered.length > 0 ? (
                        dataFiltered.map((row) => (
                          <InstallmentTableRow
                            key={row.id}
                            row={row}
                            selected={selected.includes(row.id)}
                            onSelectRow={() => handleSelectRow(row.id)}
                          />
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              {notFound ? `No installments found for "${filterName}"` : 'No installments found'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
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
                onPageChange={handleChangePage} // Triggers server request for new page
                rowsPerPageOptions={[10, 20, 50]}
                onRowsPerPageChange={handleChangeRowsPerPage} // Triggers server request with new limit
              />
            </>
          )}
        </Card>
      </Container>
    </DashboardContent>
  );
}

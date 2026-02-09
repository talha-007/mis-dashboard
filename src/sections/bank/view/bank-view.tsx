import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import bankService from 'src/redux/services/bank.services';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { emptyRows } from '../utils';
import { TableNoData } from '../table-no-data';
import { BankTableRow } from '../bank-table-row';
import { BankTableHead } from '../bank-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { BankViewDialog } from '../bank-view-dialog';
import { BankTableToolbar } from '../bank-table-toolbar';
import { BankDeleteDialog } from '../bank-delete-dialog';
import { BankStatusDialog } from '../bank-status-dialog';

import type { BankProps } from '../bank-table-row';

// ----------------------------------------------------------------------

export function BankView() {
  const router = useRouter();
  const table = useTable();

  const [filterName, setFilterName] = useState('');
  const [banks, setBanks] = useState<BankProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankProps | null>(null);

  // Fetch banks from API
  const fetchBanks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bankService.getBanks({
        search: filterName || undefined,
        page: table.page + 1, // API uses 1-based pagination
        limit: table.rowsPerPage,
        sortBy: table.orderBy,
        sortOrder: table.order,
      });

      // Handle different response structures
      const data = response.data?.data || response.data?.banks || response.data || [];
      const count = response.data?.total || response.data?.count || data.length;

      setBanks(Array.isArray(data) ? data : []);
      setTotalCount(count);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch banks';
      setError(errorMsg);
      setBanks([]);
    } finally {
      setLoading(false);
    }
  }, [filterName, table.page, table.rowsPerPage, table.orderBy, table.order]);

  // Fetch banks on mount and when filters change
  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  // API handles search, pagination, and sorting, so use banks directly
  const notFound = !banks.length && !!filterName && !loading;

  const handleOpenFormPage = (bank?: BankProps) => {
    if (bank) {
      router.push(`/bank-management/form?id=${bank._id}`);
    } else {
      router.push('/bank-management/form');
    }
  };

  const handleOpenViewDialog = (bank: BankProps) => {
    setSelectedBank(bank);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedBank(null);
  };

  const handleOpenDeleteDialog = (bank: BankProps) => {
    setSelectedBank(bank);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedBank(null);
  };

  const handleOpenStatusDialog = (bank: BankProps) => {
    setSelectedBank(bank);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedBank(null);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedBank) return;

    try {
      setError(null);
      await bankService.updateBank(selectedBank.id, { status });
      setSuccessMessage('Bank status updated successfully');
      handleCloseStatusDialog();
      fetchBanks(); // Refresh the list
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update bank status';
      setError(errorMsg);
    }
  };


  const handleDelete = async () => {
    if (!selectedBank) return;

    try {
      setError(null);
      await bankService.deleteBank(selectedBank._id);
      setSuccessMessage('Bank deleted successfully');
      handleCloseDeleteDialog();
      fetchBanks(); // Refresh the list
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete bank';
      setError(errorMsg);
    }
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Bank Management
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleOpenFormPage()}
        >
          New Bank
        </Button>
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
        <BankTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <BankTableHead
                    order={table.order}
                    orderBy={table.orderBy}
                    rowCount={banks.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        banks.map((bank) => bank._id)
                      )
                    }
                    headLabel={[
                      { id: 'name', label: 'Bank Name' },
                      { id: 'code', label: 'Code' },
                      { id: 'email', label: 'Email' },
                      { id: 'address', label: 'Address' },
                      { id: 'totalBorrowers', label: 'Borrowers' },
                      { id: 'totalAmount', label: 'Total Amount' },
                      { id: 'status', label: 'Status' },
                      { id: '', label: '' },
                    ]}
                  />
                  <TableBody>
                    {banks.map((row) => (
                        <BankTableRow
                          key={row._id}
                          row={row}
                          selected={table.selected.includes(row._id)}
                          onSelectRow={() => table.onSelectRow(row._id)}
                          onView={() => handleOpenViewDialog(row)}
                          onEdit={() => handleOpenFormPage(row)}
                          onUpdateStatus={() => handleOpenStatusDialog(row)}
                          onDelete={() => handleOpenDeleteDialog(row)}
                        />
                      ))}

                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, banks.length)}
                    />

                    {notFound && <TableNoData searchQuery={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={table.page}
              count={totalCount || banks.length}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={table.onChangeRowsPerPage}
            />
          </>
        )}
      </Card>

      <BankViewDialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        bank={selectedBank}
        onEdit={() => {
          handleCloseViewDialog();
          handleOpenFormPage(selectedBank || undefined);
        }}
      />

      <BankDeleteDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onDelete={handleDelete}
        bank={selectedBank}
      />

      <BankStatusDialog
        open={openStatusDialog}
        onClose={handleCloseStatusDialog}
        onUpdate={handleUpdateStatus}
        bank={selectedBank}
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
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

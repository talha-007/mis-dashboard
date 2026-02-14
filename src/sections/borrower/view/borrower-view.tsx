import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import borrowerService from 'src/redux/services/borrowServices';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { TableEmptyRows } from '../table-empty-rows';
import { BorrowerTableRow } from '../borrower-table-row';
import { BorrowerTableHead } from '../borrower-table-head';
import { BorrowerTableToolbar } from '../borrower-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { BorrowerProps } from '../borrower-table-row';

// ----------------------------------------------------------------------

export function BorrowerView() {
  const navigate = useNavigate();
  const table = useTable();

  const [filterName, setFilterName] = useState('');
  const [borrowers, setBorrowers] = useState<BorrowerProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch borrowers on component mount
  useEffect(() => {
    fetchBorrowers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Replace with actual API call when service is ready
      const response = await borrowerService.list({ page: 1, limit: 100 });

      if (response.status === 200) {
        setBorrowers(response.data.borrowers);
      }

      // For now, use mock data
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load borrowers';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBorrower = useCallback(() => {
    navigate('/borrower-management/add');
  }, [navigate]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirm({ open: true, id });
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;

    setIsDeleting(true);
    try {
      await borrowerService.deleteById(deleteConfirm.id);
      toast.success('Borrower deleted successfully!');
      setDeleteConfirm({ open: false, id: null });
      fetchBorrowers();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to delete borrower';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ open: false, id: null });
  };

  const dataFiltered: BorrowerProps[] = applyFilter({
    inputData: borrowers,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });
  console.log('dataFiltered', dataFiltered);

  const notFound = !dataFiltered.length || !!filterName;

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
          Borrower Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAddBorrower}
          sx={{
            bgcolor: 'grey.800',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.main',
            },
          }}
        >
          Add Borrower
        </Button>
      </Box>

      <Card>
        {isLoading && (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!isLoading && (
          <>
            <BorrowerTableToolbar
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
                  <BorrowerTableHead
                    order={table.order}
                    orderBy={table.orderBy}
                    rowCount={borrowers.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        borrowers.map((borrower) => borrower.id)
                      )
                    }
                    headLabel={[
                      { id: 'name', label: 'Borrower' },
                      { id: 'loanAmount', label: 'Loan' },
                      { id: 'status', label: 'Status' },
                      { id: 'rating', label: 'Rating', align: 'center' },
                      { id: '' },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <BorrowerTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDelete={handleDeleteClick}
                        />
                      ))}

                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, borrowers.length)}
                    />

                    {notFound && <TableNoData searchQuery={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={table.page}
              count={borrowers.length}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={table.onChangeRowsPerPage}
            />
          </>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Borrower</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this borrower? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit" disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            loading={isDeleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function useTable() {
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

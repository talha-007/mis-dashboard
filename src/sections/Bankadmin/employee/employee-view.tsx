import { toast } from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { useDebounce } from 'src/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import bankAdminService from 'src/redux/services/bank-admin.services';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from './table-no-data';
import { TableEmptyRows } from './table-empty-rows';
import { EmployeeTableRow } from './employee-table-row';
import { EmployeeTableHead } from './employee-table-head';
import { EmployeeFormDialog } from './employee-form-dialog';
import { EmployeeTableToolbar } from './employee-table-toolbar';
import { emptyRows, applyFilter, getComparator } from './utils';

import type { EmployeeProps } from './employee-table-row';

// ----------------------------------------------------------------------

export function EmployeeView() {
  const table = useTable();

  const [employees, setEmployees] = useState<EmployeeProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const debouncedFilterName = useDebounce(filterName, 400);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingEmployee, setEditingEmployee] = useState<EmployeeProps | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await bankAdminService.getEmployees();
      const raw = res.data?.data ?? res.data;
      const list = raw?.employees ?? raw ?? [];
      const mapped: EmployeeProps[] = Array.isArray(list)
        ? list.map((e: any) => ({
            _id: String(e._id ?? e.id),
            name: e.name ?? '',
            email: e.email ?? '',
            phone: e.phone ?? '',
            isActive: e.isActive ?? e.active ?? true,
            openCases: e.openCases ?? e.openCaseCount ?? 0,
          }))
        : [];
      setEmployees(mapped);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load employees');
      setEmployees([]);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleOpenAddDialog = () => {
    setFormMode('add');
    setEditingEmployee(null);
    setFormDialogOpen(true);
  };

  const handleOpenEditDialog = (row: EmployeeProps) => {
    setFormMode('edit');
    setEditingEmployee(row);
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setEditingEmployee(null);
  };

  const handleFormSubmit = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
  }) => {
    if (formMode === 'edit' && editingEmployee) {
      await bankAdminService.updateEmployee(editingEmployee._id, data);
      toast.success('Employee updated successfully');
    } else {
      await bankAdminService.createEmployee(data);
      toast.success('Employee added successfully');
    }
    fetchEmployees();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    setIsDeleting(true);
    try {
      await bankAdminService.deleteEmployee(deleteConfirm.id);
      toast.success('Employee deleted successfully');
      setDeleteConfirm({ open: false, id: null });
      fetchEmployees();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete employee');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ open: false, id: null });
  };

  const dataFiltered = applyFilter({
    inputData: employees,
    comparator: getComparator(table.order, table.orderBy),
    filterName: debouncedFilterName,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = !dataFiltered.length && !!debouncedFilterName && !isLoading;

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Employees
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenAddDialog}
        >
          Add employee
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
            <EmployeeTableToolbar
              numSelected={table.selected.length}
              filterName={filterName}
              onFilterName={(e) => {
                setFilterName(e.target.value);
                table.onResetPage();
              }}
              onReload={fetchEmployees}
             
            />

            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 720 }}>
                  <EmployeeTableHead
                    order={table.order}
                    orderBy={table.orderBy}
                    rowCount={employees.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    headLabel={[
                      { id: 'name', label: 'Name' },
                      { id: 'phone', label: 'Phone' },
                      { id: 'openCases', label: 'Open cases', align: 'right' },
                      { id: 'isActive', label: 'Status' },
                      { id: '', label: '', align: 'right' },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered.length > 0 ? (
                      dataInPage.map((row) => (
                        <EmployeeTableRow
                          key={row._id}
                          row={row}
                          selected={table.selected.includes(row._id)}
                          onSelectRow={() => table.onSelectRow(row._id)}
                          onEdit={handleOpenEditDialog}
                          onDelete={handleDeleteClick}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            {notFound
                              ? `No employees found for "${debouncedFilterName}"`
                              : 'No employees found'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}

                    {dataFiltered.length > 0 && (
                      <TableEmptyRows
                        height={68}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                      />
                    )}

                    {notFound && <TableNoData searchQuery={debouncedFilterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={table.page}
              count={dataFiltered.length}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={table.onChangeRowsPerPage}
            />
          </>
        )}
      </Card>

      <EmployeeFormDialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        onSuccess={fetchEmployees}
        mode={formMode}
        initialData={editingEmployee}
        onSubmit={handleFormSubmit}
      />

      <Dialog open={deleteConfirm.open} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this employee? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit" disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={18} /> : undefined}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
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
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      if (!id) return;
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectRow = useCallback(
    (id: string) => {
      const newSelected = selected.includes(id)
        ? selected.filter((v) => v !== id)
        : [...selected, id];
      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => setPage(0), []);

  const onChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
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
    onChangeRowsPerPage,
  };
}

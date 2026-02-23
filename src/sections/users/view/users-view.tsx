import { toast } from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Typography } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import usersService from 'src/redux/services/users.services';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { UsersTableRow } from '../users-table-row';
import { UsersTableHead } from '../users-table-head';
import { UsersTableToolbar } from '../users-table-toolbar';

const TABLE_HEAD = [
  { id: 'firstName', label: 'First Name', width: 150 },
  { id: 'lastName', label: 'Last Name', width: 150 },
  { id: 'email', label: 'Email', width: 200 },
  { id: 'phone', label: 'Phone', width: 150 },
  { id: 'role', label: 'Role', width: 120 },

  { id: '', label: '', width: 80 },
];

export function UsersView() {
  const router = useRouter();

  const [tableData, setTableData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterName, setFilterName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    id: null as string | null,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Server-side pagination and search: send page, limit, and search to server
      const params: any = {
        page: page + 1, // Convert 0-based to 1-based for server
        limit: rowsPerPage,
      };

      // Add search parameter if filterName is provided
      if (filterName.trim()) {
        params.search = filterName.trim();
      }

      const response = await usersService.list(params);

      if (response.status === 200) {
        const data = response.data?.data || response.data;
        const { users = [], pagination = {} } = data;

        // Extract users array and set table data (only current page data from server)
        setTableData(Array.isArray(users) ? users : []);

        // Set pagination info from server response
        setTotalCount(pagination.total || 0);
        setTotalPages(pagination.totalPages || 1);

        // Optional: Sync page state with server's currentPage if needed
        // Note: Server uses 1-based, our state uses 0-based
        if (pagination.currentPage && pagination.currentPage !== page + 1) {
          // Only adjust if there's a mismatch (shouldn't happen normally)
          console.warn('Page mismatch detected');
        }
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch users';
      setError(errorMessage);
      setTableData([]);
      setTotalCount(0);
      setTotalPages(0);
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage, filterName]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Server-side pagination: changing page triggers new API call
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    // fetchUsers will be called automatically via useEffect dependency
  };

  // Server-side pagination: changing rows per page resets to first page and triggers new API call
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
    // fetchUsers will be called automatically via useEffect dependency
  };

  const handleAddUser = () => {
    router.push('/users-management/add');
  };

  const handleEditRow = (userId: string) => {
    router.push(`/users-management/edit/${userId}`);
  };

  const handleViewRow = (userId: string) => {
    router.push(`/users-management/view/${userId}`);
  };

  const handleDeleteRow = (userId: string) => {
    setDeleteConfirm({ open: true, id: userId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;

    setIsDeleting(true);
    try {
      await usersService.deleteById(deleteConfirm.id);
      toast.success('User deleted successfully!');
      setDeleteConfirm({ open: false, id: null });

      // After deletion, handle server-side pagination:
      // If we're on a page that will become empty (last item), go back one page
      // Otherwise, refetch current page
      if (tableData.length === 1 && page > 0) {
        // Go back one page - fetchUsers will be called automatically via useEffect
        setPage(page - 1);
      } else {
        // Refetch current page from server
        fetchUsers();
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ open: false, id: null });
  };

  // Server-side search: changing filter resets to first page and triggers new API call
  const handleFilterByName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
    setPage(0); // Reset to first page when searching
    // fetchUsers will be called automatically via useEffect dependency
  };

  return (
    <DashboardContent>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <h2>Customers Management</h2>
          <p style={{ color: '#999', marginTop: 4 }}>Manage general customers in the system</p>
        </Box>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <UsersTableToolbar filterName={filterName} onFilterName={handleFilterByName} />

        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <UsersTableHead headLabel={TABLE_HEAD} />
                  <TableBody>
                    {tableData.length > 0 ? (
                      tableData.map((row) => (
                        <UsersTableRow
                          key={row.id}
                          id={row.id}
                          firstName={row.name || ''}
                          lastName={row.lastname || ''}
                          email={row.email}
                          phone={row.phone || 'N/A'}
                          role={row.role || 'user'}
                          onViewRow={handleViewRow}
                          onEditRow={handleEditRow}
                          onDeleteRow={handleDeleteRow}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={TABLE_HEAD.length} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            {filterName ? `No users found for "${filterName}"` : 'No users found'}
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
              page={page}
              component="div"
              count={totalCount} // Total count from server (all pages)
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage} // Triggers server request for new page
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={handleChangeRowsPerPage} // Triggers server request with new limit
            />
          </>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onClose={handleCancelDelete}>
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={isDeleting}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleConfirmDelete}
            loading={isDeleting}
            color="error"
            variant="contained"
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

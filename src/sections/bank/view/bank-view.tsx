import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { _banks } from 'src/_mock/_bank';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { BankTableRow } from '../bank-table-row';
import { BankTableHead } from '../bank-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { BankFormDialog } from '../bank-form-dialog';
import { BankViewDialog } from '../bank-view-dialog';
import { BankTableToolbar } from '../bank-table-toolbar';
import { BankDeleteDialog } from '../bank-delete-dialog';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { BankProps } from '../bank-table-row';

// ----------------------------------------------------------------------

export function BankView() {
  const table = useTable();

  const [filterName, setFilterName] = useState('');
  const [banks, setBanks] = useState<BankProps[]>(_banks);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankProps | null>(null);

  const dataFiltered = applyFilter({
    inputData: banks,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const handleOpenFormDialog = (bank?: BankProps) => {
    setSelectedBank(bank || null);
    setOpenFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setSelectedBank(null);
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

  const handleSubmitForm = (data: BankProps) => {
    if (selectedBank) {
      // Update existing bank
      setBanks((prev) => prev.map((bank) => (bank.id === data.id ? data : bank)));
    } else {
      // Add new bank
      setBanks((prev) => [...prev, data]);
    }
  };

  const handleDelete = () => {
    if (selectedBank) {
      setBanks((prev) => prev.filter((bank) => bank.id !== selectedBank.id));
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
          onClick={() => handleOpenFormDialog()}
        >
          New Bank
        </Button>
      </Box>

      <Card>
        <BankTableToolbar
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
              <BankTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={banks.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    banks.map((bank) => bank.id)
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
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <BankTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onView={() => handleOpenViewDialog(row)}
                      onEdit={() => handleOpenFormDialog(row)}
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
          count={banks.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <BankFormDialog
        open={openFormDialog}
        onClose={handleCloseFormDialog}
        onSubmit={handleSubmitForm}
        bank={selectedBank}
      />

      <BankViewDialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        bank={selectedBank}
        onEdit={() => {
          handleCloseViewDialog();
          handleOpenFormDialog(selectedBank || undefined);
        }}
      />

      <BankDeleteDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onDelete={handleDelete}
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

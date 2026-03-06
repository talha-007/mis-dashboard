import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { useDebounce } from 'src/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import bankAdminService from 'src/redux/services/bank-admin.services';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { RecoveryTableRow } from '../recovery-table-row';
import { RecoveryTableHead } from '../recovery-table-head';
import { RecoveryTableToolbar } from '../recovery-table-toolbar';

import type { RecoveryProps } from '../recovery-table-row';

// ----------------------------------------------------------------------

type Employee = { _id: string; name: string; email: string };

type RecoveryCase = {
  id: string;
  borrowerName: string;
  loanAmount: number;
  dueAmount: number;
  status: string;
  assignedOfficer: string | null;
  assignedOfficerId: string | null;
  installmentId: string;
  notes: Array<{ text: string; createdAt: string; author?: string }>;
  createdAt: string;
};

const CASE_STATUSES = ['open', 'in_progress', 'resolved', 'escalated'];

function statusColor(
  s: string
): 'default' | 'warning' | 'success' | 'error' | 'info' | 'primary' | 'secondary' {
  if (s === 'open') return 'warning';
  if (s === 'in_progress') return 'info';
  if (s === 'resolved') return 'success';
  if (s === 'escalated') return 'error';
  return 'default';
}

// ----------------------------------------------------------------------

export function RecoveryView() {
  const [mainTab, setMainTab] = useState<'overdues' | 'cases'>('overdues');

  return (
    <DashboardContent>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Recoveries & Overdues
        </Typography>
      </Box>

      {/* Main page-level tab switcher */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={mainTab} onChange={(_e, v) => setMainTab(v)}>
          <Tab
            label="Overdues & Dues"
            value="overdues"
            icon={<Iconify icon="solar:bill-list-bold-duotone" />}
            iconPosition="start"
          />
          <Tab
            label="Recovery Cases"
            value="cases"
            icon={<Iconify icon="solar:case-round-bold-duotone" />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {mainTab === 'overdues' && <OverduesTab />}
      {mainTab === 'cases' && <RecoveryCasesTab />}
    </DashboardContent>
  );
}

// ─── Tab 1: Overdues & Dues ───────────────────────────────────────────────────

function OverduesTab() {
  const table = useTable();

  const [filterName, setFilterName] = useState('');
  const debouncedFilterName = useDebounce(filterName, 400);
  const [recoveries, setRecoveries] = useState<RecoveryProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [typeFilter, setTypeFilter] = useState<'all' | 'overdues' | 'dues'>('all');
  const [summary, setSummary] = useState<any>(null);

  // Assign officer dialog state
  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    installmentId: string | null;
  }>({ open: false, installmentId: null });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [assigning, setAssigning] = useState(false);

  const mapApiToRecovery = useCallback((item: any): RecoveryProps => {
    const daysLate = Number(item.daysLate || 0);
    const isOverdue = item.isOverdue || daysLate > 0;
    let status: 'overdue' | 'recovered' | 'defaulted' = 'overdue';
    if (item.status === 'recovered' || item.status === 'paid') {
      status = 'recovered';
    } else if (item.status === 'defaulted' || daysLate >= 90) {
      status = 'defaulted';
    } else if (isOverdue || daysLate > 0 || item.status === 'due') {
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

  const fetchRecoveries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page: table.page + 1, limit: table.rowsPerPage };
      if (typeFilter !== 'all') params.type = typeFilter;
      if (debouncedFilterName.trim()) params.search = debouncedFilterName.trim();

      const response = await bankAdminService.getRecoveryOverview(params);
      if (response.status === 200) {
        const data = response.data?.data || response.data;
        const installmentsList = data?.installments || [];
        const mapped = Array.isArray(installmentsList)
          ? installmentsList.map(mapApiToRecovery).filter((item) => item.id)
          : [];
        setRecoveries(mapped);
        const pagination = data?.pagination || {};
        setTotalCount(pagination.total || mapped.length);
        if (data?.summary) setSummary(data.summary);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load recoveries');
      setRecoveries([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, typeFilter, debouncedFilterName, mapApiToRecovery]);

  useEffect(() => {
    fetchRecoveries();
  }, [fetchRecoveries]);

  const handleMarkDefaulter = useCallback(
    async (id: string) => {
      try {
        await bankAdminService.markInstallmentDefaulter(id);
        await fetchRecoveries();
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to mark as defaulter');
      }
    },
    [fetchRecoveries]
  );

  // Open assign officer dialog and pre-fetch employees list
  const handleOpenAssign = useCallback(async (installmentId: string) => {
    setAssignDialog({ open: true, installmentId });
    setSelectedEmployee('');
    try {
      const res = await bankAdminService.getEmployees({ limit: 100 });
      const raw = res.data?.data ?? res.data;
      const list = raw?.employees ?? raw ?? [];
      setEmployees(
        Array.isArray(list)
          ? list.map((e: any) => ({ _id: e._id ?? e.id, name: e.name, email: e.email }))
          : []
      );
    } catch {
      setEmployees([]);
    }
  }, []);

  const handleConfirmAssign = useCallback(async () => {
    if (!assignDialog.installmentId || !selectedEmployee) return;
    try {
      setAssigning(true);
      await bankAdminService.assignInstallmentOfficer(assignDialog.installmentId, selectedEmployee);
      setAssignDialog({ open: false, installmentId: null });
      await fetchRecoveries();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to assign officer');
    } finally {
      setAssigning(false);
    }
  }, [assignDialog.installmentId, selectedEmployee, fetchRecoveries]);

  const dataFiltered = recoveries;
  const notFound = !dataFiltered.length && !!debouncedFilterName && !loading;

  return (
    <Card>
      <RecoveryTableToolbar
        numSelected={table.selected.length}
        filterName={filterName}
        onFilterName={(e: React.ChangeEvent<HTMLInputElement>) => {
          setFilterName(e.target.value);
          table.onResetPage();
        }}
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs
          value={typeFilter}
          onChange={(_e, v) => {
            setTypeFilter(v);
            table.onResetPage();
          }}
        >
          <Tab label="All" value="all" />
          <Tab label="Overdues" value="overdues" />
          <Tab label="Dues" value="dues" />
        </Tabs>
      </Box>

      {summary && (
        <Box sx={{ p: 2, bgcolor: 'background.neutral', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              Total Dues: <strong>{summary.totalDues || summary.duesCount || 0}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overdues: <strong>{summary.overduesCount || 0}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Due Amount: <strong>{fCurrency(summary.totalDueAmount || 0)}</strong>
            </Typography>
            {summary.urgentOverdues > 0 && (
              <Typography variant="body2" color="error">
                Urgent: <strong>{summary.urgentOverdues}</strong>
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
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
                        onMarkDefaulter={handleMarkDefaulter}
                        onAssignOfficer={handleOpenAssign}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          {notFound
                            ? `No recoveries found for "${debouncedFilterName}"`
                            : 'No recoveries found'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {notFound && <TableNoData searchQuery={debouncedFilterName} />}
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
        </>
      )}

      {/* Assign Officer Dialog */}
      <Dialog
        open={assignDialog.open}
        onClose={() => setAssignDialog({ open: false, installmentId: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Assign Recovery Officer</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {employees.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No employees found. Please add employees first.
            </Typography>
          ) : (
            <TextField
              select
              fullWidth
              label="Select Officer"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              sx={{ mt: 1 }}
            >
              {employees.map((emp) => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.name} — {emp.email}
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog({ open: false, installmentId: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmAssign}
            disabled={!selectedEmployee || assigning}
          >
            {assigning ? 'Assigning…' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

// ─── Tab 2: Recovery Cases ────────────────────────────────────────────────────

function RecoveryCasesTab() {
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // View case dialog
  const [viewDialog, setViewDialog] = useState<{ open: boolean; caseData: RecoveryCase | null }>({
    open: false,
    caseData: null,
  });
  const [viewLoading, setViewLoading] = useState(false);

  // Change status dialog
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    caseId: string | null;
    current: string;
  }>({ open: false, caseId: null, current: '' });
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // Reassign dialog
  const [reassignDialog, setReassignDialog] = useState<{
    open: boolean;
    caseId: string | null;
  }>({ open: false, caseId: null });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [reassigning, setReassigning] = useState(false);

  const mapCase = (raw: any): RecoveryCase => {
    const rc = raw.recoveryCase ?? null;
    return {
      id: String(rc?._id ?? raw._id ?? raw.id ?? ''),
      borrowerName: raw.customerName ?? raw.borrowerName ?? 'Unknown',
      loanAmount: Number(raw.loanAmount ?? 0),
      dueAmount: Number(raw.amount ?? raw.dueAmount ?? 0),
      // Use recovery case status when available, else fall back to installment status
      status: rc?.status ?? raw.status ?? 'open',
      assignedOfficer: rc?.assignedTo?.name ?? null,
      assignedOfficerId: rc?.assignedTo?.employeeId ?? null,
      installmentId: String(raw._id ?? raw.id ?? ''),
      notes: Array.isArray(raw.notes)
        ? raw.notes.map((n: any) => ({
            text: n.text ?? n.note ?? '',
            createdAt: n.createdAt ?? '',
            author: n.author?.name ?? n.authorName ?? undefined,
          }))
        : [],
      createdAt: raw.createdAt ?? '',
    };
  };

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page: page + 1, limit: rowsPerPage };
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await bankAdminService.getRecoveryCases(params);
      const raw = res.data?.data ?? res.data;
      // recovery-overview returns { installments, pagination, summary }
      const list = raw?.installments ?? raw?.cases ?? raw?.recoveryCases ?? [];
      setCases(Array.isArray(list) ? list.map(mapCase) : []);
      setTotalCount(
        raw?.pagination?.total ?? (Array.isArray(list) ? list.length : 0)
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load recovery cases');
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleAutoAssign = useCallback(async () => {
    try {
      setAutoAssigning(true);
      setError(null);
      await bankAdminService.autoAssignRecoveryCases();
      await fetchCases();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Auto-assign failed');
    } finally {
      setAutoAssigning(false);
    }
  }, [fetchCases]);

  // View case details — show row data immediately, then enrich notes from detail API
  const handleViewCase = useCallback(async (c: RecoveryCase) => {
    setViewDialog({ open: true, caseData: c });
    setViewLoading(true);
    try {
      const res = await bankAdminService.getRecoveryCaseById(c.id);
      const raw = res.data?.data ?? res.data;
      if (raw) {
        // Only pull in fields the detail endpoint adds (e.g. full notes history).
        // Keep the original row values for everything else so they don't get
        // blanked out by the different shape of the recovery-case detail response.
        const notes: RecoveryCase['notes'] = Array.isArray(raw.notes)
          ? raw.notes.map((n: any) => ({
              text: n.text ?? n.note ?? '',
              createdAt: n.createdAt ?? '',
              author: n.author?.name ?? n.authorName ?? undefined,
            }))
          : c.notes;
        setViewDialog({ open: true, caseData: { ...c, notes } });
      }
    } catch {
      // keep original row data on error
    } finally {
      setViewLoading(false);
    }
  }, []);

  // Change status
  const handleOpenStatus = useCallback((caseId: string, current: string) => {
    setStatusDialog({ open: true, caseId, current });
    setNewStatus(current);
    setStatusNote('');
  }, []);

  const handleConfirmStatus = useCallback(async () => {
    if (!statusDialog.caseId || !newStatus) return;
    try {
      setSavingStatus(true);
      await bankAdminService.updateRecoveryCaseStatus(statusDialog.caseId, {
        status: newStatus,
        note: statusNote.trim() || undefined,
      });
      setStatusDialog({ open: false, caseId: null, current: '' });
      await fetchCases();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  }, [statusDialog.caseId, newStatus, statusNote, fetchCases]);

  // Reassign officer
  const handleOpenReassign = useCallback(async (caseId: string) => {
    setReassignDialog({ open: true, caseId });
    setSelectedEmployee('');
    try {
      const res = await bankAdminService.getEmployees({ limit: 100 });
      const raw = res.data?.data ?? res.data;
      const list = raw?.employees ?? raw ?? [];
      setEmployees(
        Array.isArray(list)
          ? list.map((e: any) => ({ _id: e._id ?? e.id, name: e.name, email: e.email }))
          : []
      );
    } catch {
      setEmployees([]);
    }
  }, []);

  const handleConfirmReassign = useCallback(async () => {
    if (!reassignDialog.caseId || !selectedEmployee) return;
    try {
      setReassigning(true);
      await bankAdminService.assignRecoveryCase(reassignDialog.caseId, {
        employeeId: selectedEmployee,
      });
      setReassignDialog({ open: false, caseId: null });
      await fetchCases();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to reassign case');
    } finally {
      setReassigning(false);
    }
  }, [reassignDialog.caseId, selectedEmployee, fetchCases]);

  return (
    <>
      {/* Header row with auto-assign button */}
      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={
            autoAssigning ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Iconify icon="solar:magic-stick-3-bold-duotone" />
            )
          }
          onClick={handleAutoAssign}
          disabled={autoAssigning}
        >
          {autoAssigning ? 'Auto-assigning…' : 'Auto-assign all'}
        </Button>
      </Stack>

      <Card>
        {/* Status filter tabs */}
        {/* <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={statusFilter}
            onChange={(_e, v) => {
              setStatusFilter(v);
              setPage(0);
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All" value="all" />
            <Tab label="Open" value="open" />
            <Tab label="In Progress" value="in_progress" />
            <Tab label="Resolved" value="resolved" />
            <Tab label="Escalated" value="escalated" />
          </Tabs>
        </Box> */}

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Scrollbar>
              <TableContainer>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Borrower</TableCell>
                      <TableCell>Loan</TableCell>
                      <TableCell>Due Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Assigned Officer</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cases.length > 0 ? (
                      cases.map((c) => (
                        <TableRow key={c.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2">{c.borrowerName}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{fCurrency(c.loanAmount)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="error.main" fontWeight={600}>
                              {fCurrency(c.dueAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Label color={statusColor(c.status)}>
                              {c.status.replace('_', ' ')}
                            </Label>
                          </TableCell>
                          <TableCell>
                            {c.assignedOfficer ? (
                              <Chip
                                size="small"
                                label={
                                  c.assignedOfficerId
                                    ? `${c.assignedOfficer} (${c.assignedOfficerId})`
                                    : c.assignedOfficer
                                }
                                icon={<Iconify icon="solar:user-rounded-bold" />}
                              />
                            ) : (
                              <Typography variant="caption" color="text.disabled">
                                Unassigned
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {c.createdAt ? fDate(c.createdAt) : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleViewCase(c)}
                                startIcon={<Iconify icon="solar:eye-bold" />}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                onClick={() => handleOpenStatus(c.id, c.status)}
                                startIcon={<Iconify icon="solar:pen-bold" />}
                              >
                                Status
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="info"
                                onClick={() => handleOpenReassign(c.id)}
                                startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
                              >
                                Reassign
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No recovery cases found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={page}
              count={totalCount}
              rowsPerPage={rowsPerPage}
              onPageChange={(_e, newPage) => setPage(newPage)}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Card>

      {/* ── View Case Dialog ─────────────────────────────────── */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, caseData: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Recovery Case Details
          {viewDialog.caseData && (
            <Label color={statusColor(viewDialog.caseData.status)} sx={{ ml: 1 }}>
              {viewDialog.caseData.status.replace('_', ' ')}
            </Label>
          )}
        </DialogTitle>
        <DialogContent>
          {viewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : viewDialog.caseData ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack direction="row" spacing={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Borrower
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {viewDialog.caseData.borrowerName}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Loan Amount
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {fCurrency(viewDialog.caseData.loanAmount)}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Due Amount
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">
                    {fCurrency(viewDialog.caseData.dueAmount)}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Assigned Officer
                  </Typography>
                  <Typography variant="body2">
                    {viewDialog.caseData.assignedOfficer ?? 'Unassigned'}
                  </Typography>
                  {viewDialog.caseData.assignedOfficerId && (
                    <Typography variant="caption" color="text.disabled">
                      {viewDialog.caseData.assignedOfficerId}
                    </Typography>
                  )}
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Opened
                  </Typography>
                  <Typography variant="body2">
                    {viewDialog.caseData.createdAt ? fDate(viewDialog.caseData.createdAt) : '—'}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Notes ({viewDialog.caseData.notes.length})
                </Typography>
                {viewDialog.caseData.notes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No notes yet.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {viewDialog.caseData.notes.map((note, i) => (
                      <Box
                        key={i}
                        sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}
                      >
                        <Typography variant="body2">{note.text}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {note.author ? `${note.author} · ` : ''}
                          {note.createdAt ? fDate(note.createdAt) : ''}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, caseData: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Change Status Dialog ──────────────────────────────── */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, caseId: null, current: '' })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Update Case Status</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              label="New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {CASE_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Note (optional)"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Add a note about this status change…"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, caseId: null, current: '' })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmStatus}
            disabled={!newStatus || savingStatus}
          >
            {savingStatus ? 'Saving…' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reassign Dialog ───────────────────────────────────── */}
      <Dialog
        open={reassignDialog.open}
        onClose={() => setReassignDialog({ open: false, caseId: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Reassign Recovery Officer</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {employees.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No employees found. Please add employees first.
            </Typography>
          ) : (
            <TextField
              select
              fullWidth
              label="Select Officer"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              sx={{ mt: 1 }}
            >
              {employees.map((emp) => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.name} — {emp.email}
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReassignDialog({ open: false, caseId: null })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmReassign}
            disabled={!selectedEmployee || reassigning}
          >
            {reassigning ? 'Reassigning…' : 'Reassign'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Shared useTable hook ─────────────────────────────────────────────────────

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
    setSelected(checked ? newSelecteds : []);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      setSelected((prev) =>
        prev.includes(inputValue)
          ? prev.filter((v) => v !== inputValue)
          : [...prev, inputValue]
      );
    },
    []
  );

  const onResetPage = useCallback(() => setPage(0), []);

  const onChangePage = useCallback((_: unknown, newPage: number) => setPage(newPage), []);

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
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}

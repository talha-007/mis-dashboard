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
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import employeeService from 'src/redux/services/employee.services';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type MyCase = {
  id: string;
  caseId: string;
  // Borrower (borrowerId object)
  borrowerName: string;
  borrowerRef: string;
  // Customer (customerId object)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCnic: string;
  // Loan (loanApplicationId object)
  loanAmount: number;
  installmentAmount: number;
  loanStatus: string;
  // Case fields
  dueAmount: number;
  daysOverdue: number;
  status: string;
  promiseDate: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapCase(c: any): MyCase {
  const borrower = c.borrowerId && typeof c.borrowerId === 'object' ? c.borrowerId : null;
  const customer = c.customerId && typeof c.customerId === 'object' ? c.customerId : null;
  const loan =
    c.loanApplicationId && typeof c.loanApplicationId === 'object' ? c.loanApplicationId : null;

  return {
    id: String(c._id ?? c.id ?? ''),
    caseId: c.caseId ?? '—',
    borrowerName: borrower?.name ?? c.borrowerName ?? '—',
    borrowerRef: borrower?.borrowerId ?? '—',
    customerName: customer
      ? `${customer.name ?? ''} ${customer.lastname ?? ''}`.trim()
      : (c.customerName ?? '—'),
    customerEmail: customer?.email ?? '—',
    customerPhone: customer?.phone ?? '—',
    customerCnic: customer?.cnic ?? '—',
    loanAmount: Number(loan?.amount ?? c.loanAmount ?? 0),
    installmentAmount: Number(loan?.installmentAmount ?? c.installmentAmount ?? 0),
    loanStatus: loan?.status ?? '—',
    dueAmount: Number(c.dueAmount ?? 0),
    daysOverdue: Number(c.daysOverdue ?? c.daysLate ?? 0),
    status: c.status ?? 'open',
    promiseDate: c.promiseDate ?? null,
    resolvedAt: c.resolvedAt ?? null,
    createdAt: c.createdAt ?? '',
    updatedAt: c.updatedAt ?? '',
  };
}

function statusColor(
  s: string
): 'default' | 'warning' | 'success' | 'error' | 'info' | 'primary' | 'secondary' {
  if (s === 'open') return 'warning';
  if (s === 'in_progress') return 'info';
  if (s === 'resolved') return 'success';
  return 'default';
}

const CASE_STATUSES = ['open', 'in_progress', 'resolved'];

// ----------------------------------------------------------------------

export function RecoveryOfficerDashboardView() {
  const [cases, setCases] = useState<MyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail dialog
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; data: MyCase | null }>({
    open: false,
    data: null,
  });

  // Add note dialog
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; caseId: string | null }>({
    open: false,
    caseId: null,
  });
  const [noteForm, setNoteForm] = useState({
    note: '',
    contactMethod: '',
    outcome: '',
    followUpDate: '',
  });
  const [savingNote, setSavingNote] = useState(false);

  // Update status dialog
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    caseId: string | null;
    current: string;
  }>({ open: false, caseId: null, current: '' });
  const [newStatus, setNewStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employeeService.getMyCases();
      const raw = res.data?.data ?? res.data;
      const list = raw?.cases ?? raw ?? [];
      setCases(Array.isArray(list) ? list.map(mapCase) : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load cases');
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const filteredCases =
    statusFilter === 'all' ? cases : cases.filter((c) => c.status === statusFilter);

  // ── Note ──────────────────────────────────────────────────────────────
  const handleOpenNote = (caseId: string) => {
    setNoteForm({ note: '', contactMethod: '', outcome: '', followUpDate: '' });
    setNoteDialog({ open: true, caseId });
  };

  const noteFormValid =
    noteForm.note.trim() &&
    noteForm.contactMethod.trim() &&
    noteForm.outcome.trim() &&
    noteForm.followUpDate.trim();

  const handleSaveNote = async () => {
    if (!noteDialog.caseId || !noteFormValid) return;
    try {
      setSavingNote(true);
      await employeeService.addMyCaseNote(noteDialog.caseId, {
        note: noteForm.note.trim(),
        contactMethod: noteForm.contactMethod,
        outcome: noteForm.outcome,
        followUpDate: noteForm.followUpDate,
      });
      setNoteDialog({ open: false, caseId: null });
      setNoteForm({ note: '', contactMethod: '', outcome: '', followUpDate: '' });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  // ── Status ────────────────────────────────────────────────────────────
  const handleOpenStatus = (caseId: string, current: string) => {
    setNewStatus(current);
    setStatusDialog({ open: true, caseId, current });
  };

  const handleSaveStatus = async () => {
    if (!statusDialog.caseId || !newStatus) return;
    try {
      setSavingStatus(true);
      await employeeService.updateMyCaseStatus(statusDialog.caseId, { status: newStatus });
      setStatusDialog({ open: false, caseId: null, current: '' });
      await fetchCases();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={4}>
        <Typography variant="h4" flexGrow={1}>
          My Recovery Cases
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={statusFilter}
            onChange={(_e, v) => setStatusFilter(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All" value="all" />
            <Tab label="Open" value="open" />
            <Tab label="In Progress" value="in_progress" />
            <Tab label="Resolved" value="resolved" />
            <Tab label="Closed" value="closed" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Case ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Borrower</TableCell>
                  <TableCell>Loan / Due</TableCell>
                  <TableCell align="center">Days Overdue</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCases.length ? (
                  filteredCases.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {c.caseId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fDate(c.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="subtitle2">{c.customerName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.customerPhone}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{c.borrowerName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.borrowerRef}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{fCurrency(c.loanAmount)}</Typography>
                        <Typography variant="caption" color="error.main" fontWeight={600}>
                          Due: {fCurrency(c.dueAmount)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography
                          variant="subtitle2"
                          color={
                            c.daysOverdue >= 60
                              ? 'error.main'
                              : c.daysOverdue >= 30
                                ? 'warning.main'
                                : 'text.primary'
                          }
                        >
                          {c.daysOverdue}d
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Label color={statusColor(c.status)}>{c.status.replace('_', ' ')}</Label>
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setDetailDialog({ open: true, data: c })}
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
                            variant="text"
                            onClick={() => handleOpenNote(c.id)}
                            startIcon={<Iconify icon="solar:chat-round-dots-bold" />}
                          >
                            Note
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No cases found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* ── Case Detail Dialog ─────────────────────────────────────── */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, data: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <span>Case Details</span>
            {detailDialog.data && (
              <>
                <Typography variant="body2" color="text.secondary">
                  {detailDialog.data.caseId}
                </Typography>
                <Label color={statusColor(detailDialog.data.status)}>
                  {detailDialog.data.status.replace('_', ' ')}
                </Label>
              </>
            )}
          </Stack>
        </DialogTitle>

        {detailDialog.data && (
          <DialogContent dividers>
            <Stack spacing={2.5}>
              {/* Customer */}
              <Box>
                <Typography variant="overline" color="text.disabled">
                  Customer
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={600}>
                      {detailDialog.data.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      CNIC: {detailDialog.data.customerCnic}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2">{detailDialog.data.customerPhone}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {detailDialog.data.customerEmail}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Borrower */}
              <Box>
                <Typography variant="overline" color="text.disabled">
                  Borrower
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {detailDialog.data.borrowerName}
                  </Typography>
                  <Chip size="small" label={detailDialog.data.borrowerRef} />
                </Stack>
              </Box>

              <Divider />

              {/* Loan */}
              <Box>
                <Typography variant="overline" color="text.disabled">
                  Loan
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary">
                      Loan Amount
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {fCurrency(detailDialog.data.loanAmount)}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary">
                      Installment
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {fCurrency(detailDialog.data.installmentAmount)}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary">
                      Loan Status
                    </Typography>
                    <Typography variant="body2">{detailDialog.data.loanStatus}</Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Recovery */}
              <Box>
                <Typography variant="overline" color="text.disabled">
                  Recovery
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary">
                      Due Amount
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="error.main">
                      {fCurrency(detailDialog.data.dueAmount)}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary">
                      Days Overdue
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={detailDialog.data.daysOverdue >= 30 ? 'error.main' : 'text.primary'}
                    >
                      {detailDialog.data.daysOverdue} days
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary">
                      Promise Date
                    </Typography>
                    <Typography variant="body2">
                      {detailDialog.data.promiseDate ? fDate(detailDialog.data.promiseDate) : '—'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Dates */}
              <Stack direction="row" spacing={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Case Opened
                  </Typography>
                  <Typography variant="body2">{fDate(detailDialog.data.createdAt)}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">{fDate(detailDialog.data.updatedAt)}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Resolved At
                  </Typography>
                  <Typography variant="body2">
                    {detailDialog.data.resolvedAt ? fDate(detailDialog.data.resolvedAt) : '—'}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </DialogContent>
        )}

        <DialogActions>
          {detailDialog.data && (
            <>
              <Button
                size="small"
                startIcon={<Iconify icon="solar:chat-round-dots-bold" />}
                onClick={() => {
                  const id = detailDialog.data!.id;
                  setDetailDialog({ open: false, data: null });
                  handleOpenNote(id);
                }}
              >
                Add Note
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={<Iconify icon="solar:pen-bold" />}
                onClick={() => {
                  setDetailDialog({ open: false, data: null });
                  handleOpenStatus(detailDialog.data!.id, detailDialog.data!.status);
                }}
              >
                Update Status
              </Button>
            </>
          )}
          <Button onClick={() => setDetailDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Add Note Dialog ─────────────────────────────────────────── */}
      <Dialog
        open={noteDialog.open}
        onClose={() => setNoteDialog({ open: false, caseId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Follow-up Note</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              required
              label="Contact Method"
              value={noteForm.contactMethod}
              onChange={(e) => setNoteForm((f) => ({ ...f, contactMethod: e.target.value }))}
            >
              {['call', 'sms', 'email', 'in_person', 'whatsapp'].map((m) => (
                <MenuItem key={m} value={m}>
                  {m.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              required
              label="Outcome"
              value={noteForm.outcome}
              onChange={(e) => setNoteForm((f) => ({ ...f, outcome: e.target.value }))}
            >
              {['no_answer', 'contacted', 'promise_to_pay', 'refused', 'paid', 'other'].map((o) => (
                <MenuItem key={o} value={o}>
                  {o.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              required
              label="Follow-up Date"
              type="date"
              value={noteForm.followUpDate}
              onChange={(e) => setNoteForm((f) => ({ ...f, followUpDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              fullWidth
              required
              multiline
              minRows={3}
              label="Note"
              value={noteForm.note}
              onChange={(e) => setNoteForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Write your follow-up or call summary..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setNoteDialog({ open: false, caseId: null })}
            disabled={savingNote}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveNote}
            disabled={savingNote || !noteFormValid}
            startIcon={savingNote ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {savingNote ? 'Saving…' : 'Save Note'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Update Status Dialog ─────────────────────────────────────── */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, caseId: null, current: '' })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Update Case Status</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            select
            fullWidth
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            sx={{ mt: 1 }}
          >
            {CASE_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s.replace('_', ' ')}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setStatusDialog({ open: false, caseId: null, current: '' })}
            disabled={savingStatus}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveStatus}
            disabled={!newStatus || savingStatus}
            startIcon={savingStatus ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {savingStatus ? 'Saving…' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

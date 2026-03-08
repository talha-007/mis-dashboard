import type { SelectChangeEvent } from '@mui/material/Select';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import bankAdminService from 'src/redux/services/bank-admin.services';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { ReportTableRow } from '../report-table-row';
import { TableEmptyRows } from '../table-empty-rows';
import { ReportTableHead } from '../report-table-head';
import { ReportTableToolbar } from '../report-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

type ReportType = 'portfolio' | 'recovery' | 'credit' | 'compliance';
type ReportStatus = 'ready' | 'generating' | 'failed' | 'pending';

export type ReportRow = {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  lastGenerated: string;
  generatedBy: string;
  status: ReportStatus;
  fileSize?: string;

  from?: string;
  to?: string;
};

const REPORT_TYPES: { id: ReportType; name: string; description: string; icon: string }[] = [
  {
    id: 'portfolio',
    name: 'Portfolio Reports',
    description: 'Monthly portfolio performance and metrics',
    icon: 'solar:chart-2-bold-duotone',
  },
  {
    id: 'recovery',
    name: 'Recovery Reports',
    description: 'Aging analysis and recovery tracking',
    icon: 'solar:wallet-money-bold-duotone',
  },
  {
    id: 'credit',
    name: 'Credit Reports',
    description: 'Credit appraisal and risk assessment',
    icon: 'solar:graph-up-bold-duotone',
  },
  {
    id: 'compliance',
    name: 'Compliance Reports',
    description: 'Regulatory compliance for SECP/SBP',
    icon: 'solar:shield-check-bold-duotone',
  },
];

function typeColor(t: string): 'primary' | 'success' | 'warning' | 'error' | 'default' {
  if (t === 'portfolio') return 'primary';
  if (t === 'recovery') return 'success';
  if (t === 'credit') return 'warning';
  if (t === 'compliance') return 'error';
  return 'default';
}

function mapReport(raw: any): ReportRow {
  return {
    id: String(raw._id ?? raw.id ?? ''),
    name: raw.name ?? raw.title ?? `${raw.type ?? ''} Report`,
    type: (raw.type ?? 'portfolio') as ReportType,
    description:
      raw.description ??
      `${raw.from ? fDate(raw.from) : ''} – ${raw.to ? fDate(raw.to) : ''}`.trim(),
    lastGenerated: raw.createdAt ?? raw.generatedAt ?? '',
    generatedBy: raw.generatedBy?.name ?? raw.generatedBy ?? '—',
    status: (raw.status ?? 'pending') as ReportStatus,
    fileSize: raw.fileSize ?? undefined,

    from: raw.from,
    to: raw.to,
  };
}

// ─── today / first-of-month helpers ──────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function firstOfMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

// ----------------------------------------------------------------------

export function ReportView() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & table
  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('lastGenerated');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Generate dialog
  const [genDialog, setGenDialog] = useState(false);
  const [genForm, setGenForm] = useState<{ type: ReportType; from: string; to: string }>({
    type: 'portfolio',
    from: firstOfMonthStr(),
    to: todayStr(),
  });
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Delete confirm
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [deleting, setDeleting] = useState(false);

  // Polling for generating reports
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    try {
      setError(null);
      const res = await bankAdminService.getReports();
      const raw = res.data?.data ?? res.data;
      const list = raw?.reports ?? raw ?? [];
      setReports(Array.isArray(list) ? list.map(mapReport) : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Poll until no more "generating" reports
  useEffect(() => {
    const hasGenerating = reports.some((r) => r.status === 'generating' || r.status === 'pending');
    if (hasGenerating && !pollingRef.current) {
      pollingRef.current = setInterval(() => {
        fetchReports();
      }, 4000);
    }
    if (!hasGenerating && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    return () => {
      if (pollingRef.current && !hasGenerating) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [reports, fetchReports]);

  // ── Generate ──────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!genForm.type || !genForm.from || !genForm.to) return;
    try {
      setGenerating(true);
      setGenError(null);
      await bankAdminService.generateReport(genForm);
      setGenDialog(false);
      await fetchReports();
    } catch (err: any) {
      setGenError(err?.response?.data?.message || err?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  }, [genForm, fetchReports]);

  // ── Delete ────────────────────────────────────────────────────────────
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteDialog.id) return;
    try {
      setDeleting(true);
      await bankAdminService.deleteReport(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
      setReports((prev) => prev.filter((r) => r.id !== deleteDialog.id));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete report');
      setDeleteDialog({ open: false, id: null });
    } finally {
      setDeleting(false);
    }
  }, [deleteDialog.id]);

  // ── Download ──────────────────────────────────────────────────────────
  const handleDownload = useCallback(async (report: ReportRow, format: 'pdf' | 'excel') => {
    try {
      const res = await bankAdminService.downloadReport(report.id, format);
      const blob = new Blob([res.data], {
        type:
          format === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.type}-report-${report.id}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to download report');
    }
  }, []);

  // ── Regenerate (generate same type/period) ────────────────────────────
  const handleRegenerate = useCallback(
    async (report: ReportRow) => {
      try {
        await bankAdminService.generateReport({
          type: report.type,
          from: report.from ?? firstOfMonthStr(),
          to: report.to ?? todayStr(),
        });
        await fetchReports();
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to regenerate report');
      }
    },
    [fetchReports]
  );

  // ── Category counts ───────────────────────────────────────────────────
  const categoryCounts = REPORT_TYPES.reduce(
    (acc, t) => {
      acc[t.id] = reports.filter((r) => r.type === t.id).length;
      return acc;
    },
    {} as Record<string, number>
  );

  // ── Table helpers ─────────────────────────────────────────────────────
  const HEAD_CELLS = [
    { id: 'name', label: 'Report' },
    { id: 'type', label: 'Type' },
    { id: 'lastGenerated', label: 'Generated' },
    { id: 'generatedBy', label: 'By' },
    { id: 'status', label: 'Status' },
  ];

  const handleSort = useCallback(
    (property: string) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    },
    [order, orderBy]
  );

  const handleSelectAllRows = useCallback(
    (checked: boolean) => {
      setSelected(checked ? reports.map((n) => n.id) : []);
    },
    [reports]
  );

  const handleSelectRow = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }, []);

  const dataFiltered = applyFilter({
    inputData: reports as any,
    comparator: getComparator(order, orderBy),
    filterName,
    filterType,
  }) as ReportRow[];

  const notFound = !dataFiltered.length && (!!filterName || filterType !== 'all');

  // ─────────────────────────────────────────────────────────────────────

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4">MIS &amp; Regulatory Reports</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => {
              setGenForm({ type: 'portfolio', from: firstOfMonthStr(), to: todayStr() });
              setGenError(null);
              setGenDialog(true);
            }}
          >
            Generate Report
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Category summary cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {REPORT_TYPES.map((cat) => (
            <Grid key={cat.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1.5,
                      bgcolor: `${typeColor(cat.id)}.lighter`,
                    }}
                  >
                    <Iconify
                      icon={cat.icon}
                      width={24}
                      sx={{ color: `${typeColor(cat.id)}.dark` }}
                    />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h4">{categoryCounts[cat.id] ?? 0}</Typography>
                    <Typography variant="subtitle2" noWrap>
                      {cat.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {cat.description}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Reports table */}
        <Card>
          <ReportTableToolbar
            numSelected={selected.length}
            filterName={filterName}
            filterType={filterType}
            onFilterName={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPage(0);
              setFilterName(e.target.value);
            }}
            onFilterType={(e: SelectChangeEvent) => {
              setPage(0);
              setFilterType(e.target.value);
            }}
            onReload={fetchReports}
          />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <ReportTableHead
                    order={order}
                    orderBy={orderBy}
                    rowCount={reports.length}
                    numSelected={selected.length}
                    onSort={handleSort}
                    onSelectAllRows={handleSelectAllRows}
                    headCells={HEAD_CELLS}
                  />
                  <TableBody>
                    {dataFiltered
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <ReportTableRow
                          key={row.id}
                          row={row as any}
                          selected={selected.includes(row.id)}
                          onSelectRow={() => handleSelectRow(row.id)}
                          onDelete={() => setDeleteDialog({ open: true, id: row.id })}
                          onRegenerate={() => handleRegenerate(row)}
                          onDownload={(fmt: 'pdf' | 'excel') => handleDownload(row, fmt)}
                        />
                      ))}

                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(page, rowsPerPage, dataFiltered.length)}
                    />

                    {notFound && <TableNoData searchQuery={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          )}

          <TablePagination
            component="div"
            page={page}
            count={dataFiltered.length}
            rowsPerPage={rowsPerPage}
            onPageChange={(_e, p) => setPage(p)}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={(e) => {
              setPage(0);
              setRowsPerPage(parseInt(e.target.value, 10));
            }}
          />
        </Card>
      </Container>

      {/* ── Generate Report Dialog ──────────────────────────────────── */}
      <Dialog open={genDialog} onClose={() => setGenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {genError && (
              <Alert severity="error" onClose={() => setGenError(null)}>
                {genError}
              </Alert>
            )}
            <TextField
              select
              fullWidth
              required
              label="Report Type"
              value={genForm.type}
              onChange={(e) => setGenForm((f) => ({ ...f, type: e.target.value as ReportType }))}
            >
              {REPORT_TYPES.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Label color={typeColor(t.id)} sx={{ minWidth: 80 }}>
                      {t.id}
                    </Label>
                    <span>{t.name}</span>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              required
              label="From"
              type="date"
              value={genForm.from}
              onChange={(e) => setGenForm((f) => ({ ...f, from: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              fullWidth
              required
              label="To"
              type="date"
              value={genForm.to}
              onChange={(e) => setGenForm((f) => ({ ...f, to: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenDialog(false)} disabled={generating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generating || !genForm.from || !genForm.to}
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {generating ? 'Generating…' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ───────────────────────────────────── */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete this report? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

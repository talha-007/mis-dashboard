import { useState, useEffect, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TableContainer from '@mui/material/TableContainer';

import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import employeeService from 'src/redux/services/employee.services';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import type {
  EmployeeRecoveryStatsBody,
  RecoveryStatsPeriod,
} from 'src/types/employee-recovery-stats.types';

// ----------------------------------------------------------------------

function utcTodayYmd(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const PERIOD_OPTIONS: { value: RecoveryStatsPeriod; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

const RESERVED = new Set(['period', 'range', 'message']);

/** API uses camelCase on `stats` */
const OVERVIEW_ORDER = [
  'totalCasesAssignedToMe',
  'totalAmountToRecover',
  'activeCasesCount',
] as const;

const METRIC_LABELS: Record<string, string> = {
  totalCasesAssignedToMe: 'Total cases assigned to you',
  totalAmountToRecover: 'Total amount to recover',
  activeCasesCount: 'Active cases',
};

const GROUP_LABELS: Record<string, string> = {
  activeCasesByStatus: 'Active cases by status',
  inSelectedPeriod: 'In selected period',
};

const LEAF_LABELS: Record<string, string> = {
  newAssignmentsCount: 'New assignments',
  resolvedCasesCount: 'Resolved cases',
};

/** `activeCasesByStatus` keys (snake_case from API) */
const CASE_STATUS_LABELS: Record<string, string> = {
  in_progress: 'In progress',
  open: 'Open',
  promise_to_pay: 'Promise to pay',
};

const STATUS_ROW_ORDER = ['open', 'in_progress', 'promise_to_pay'] as const;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function camelWords(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function leafLabel(key: string): string {
  if (CASE_STATUS_LABELS[key]) return CASE_STATUS_LABELS[key];
  if (LEAF_LABELS[key]) return LEAF_LABELS[key];
  if (/[A-Za-z][a-z]*[A-Z]/.test(key) && !/\s/.test(key)) return camelWords(key);
  if (key.includes('_')) {
    return key
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
  return key
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function sortStatusSubKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const ia = STATUS_ROW_ORDER.indexOf(a as (typeof STATUS_ROW_ORDER)[number]);
    const ib = STATUS_ROW_ORDER.indexOf(b as (typeof STATUS_ROW_ORDER)[number]);
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }
    return a.localeCompare(b);
  });
}

function formatValue(pathKey: string, value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') {
    const lower = pathKey.toLowerCase();
    if (lower.includes('amount') || lower.includes('collected') || lower.includes('due')) {
      return fCurrency(value);
    }
    return String(value);
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') {
    const lower = pathKey.toLowerCase();
    if (
      lower.includes('date') ||
      lower.includes('at') ||
      lower.endsWith('time') ||
      lower.includes('start') ||
      lower.includes('end')
    ) {
      return fDate(value);
    }
    return value;
  }
  return JSON.stringify(value);
}

type TableRowModel =
  | { kind: 'section'; title: string }
  | { kind: 'data'; label: string; value: string };

/** One ordered list: section headers + data rows — single table, easy to scan */
function buildTableRows(raw: Record<string, unknown>): TableRowModel[] {
  const rows: TableRowModel[] = [];
  const consumed = new Set<string>();

  const addSection = (title: string) => rows.push({ kind: 'section', title });
  const addData = (label: string, value: string) => rows.push({ kind: 'data', label, value });

  // 1) Overview — priority scalars first, then any other scalars
  const scalars: { k: string; v: unknown }[] = [];
  const groups: { k: string; v: Record<string, unknown> }[] = [];

  for (const [k, v] of Object.entries(raw)) {
    if (RESERVED.has(k)) continue;
    if (isPlainObject(v)) groups.push({ k, v });
    else scalars.push({ k, v });
  }

  const overviewScalars = new Map(scalars.map((s) => [s.k, s.v]));
  const hasOverview =
    OVERVIEW_ORDER.some((k) => overviewScalars.has(k)) ||
    scalars.some((s) => !OVERVIEW_ORDER.includes(s.k as (typeof OVERVIEW_ORDER)[number]));

  if (hasOverview) {
    addSection('Overview');
    for (const k of OVERVIEW_ORDER) {
      if (!overviewScalars.has(k)) continue;
      addData(METRIC_LABELS[k] ?? camelWords(k), formatValue(k, overviewScalars.get(k)));
      consumed.add(k);
    }
    for (const { k, v } of scalars) {
      if (consumed.has(k)) continue;
      addData(camelWords(k), formatValue(k, v));
    }
  }

  // 2) Nested groups (fixed order when known)
  const groupOrder = ['activeCasesByStatus', 'inSelectedPeriod'];
  const sortedGroups = [...groups].sort((a, b) => {
    const ia = groupOrder.indexOf(a.k);
    const ib = groupOrder.indexOf(b.k);
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }
    return a.k.localeCompare(b.k);
  });

  for (const { k, v } of sortedGroups) {
    let subKeys = Object.keys(v);
    if (k === 'activeCasesByStatus') {
      subKeys = sortStatusSubKeys(subKeys);
    } else {
      subKeys = subKeys.sort((a, b) => a.localeCompare(b));
    }
    if (subKeys.length === 0) continue;
    addSection(GROUP_LABELS[k] ?? camelWords(k));
    for (const subKey of subKeys) {
      const path = `${k}.${subKey}`;
      addData(leafLabel(subKey), formatValue(path, v[subKey]));
    }
  }

  return rows;
}

// ----------------------------------------------------------------------

export function RecoveryStatsView() {
  const [period, setPeriod] = useState<RecoveryStatsPeriod>('week');
  const [atDate, setAtDate] = useState(utcTodayYmd);
  const [anchorForPeriod, setAnchorForPeriod] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Parsed `stats` object from API (camelCase fields) */
  const [stats, setStats] = useState<EmployeeRecoveryStatsBody | null>(null);
  /** Parsed top-level `period` from API envelope `{ type, start, end }` */
  const [reportingPeriod, setReportingPeriod] = useState<{
    type?: string;
    start?: string;
    end?: string;
  } | null>(null);

  const queryParams = useMemo(() => {
    if (period === 'day') return { period, at: atDate };
    if (anchorForPeriod) return { period, at: atDate };
    return { period };
  }, [period, atDate, anchorForPeriod]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employeeService.getRecoveryStats(queryParams);
      const raw = res.data?.data ?? res.data;
      setReportingPeriod(null);
      if (isPlainObject(raw)) {
        if (isPlainObject(raw.period)) {
          const p = raw.period as Record<string, unknown>;
          setReportingPeriod({
            type: typeof p.type === 'string' ? p.type : undefined,
            start: typeof p.start === 'string' ? p.start : undefined,
            end: typeof p.end === 'string' ? p.end : undefined,
          });
        }
        const inner =
          isPlainObject(raw.stats) && raw.stats !== null ? raw.stats : raw;
        if (isPlainObject(inner)) {
          setStats(inner as EmployeeRecoveryStatsBody);
        } else {
          setStats(null);
        }
      } else if (raw !== undefined && raw !== null) {
        setStats(null);
      } else {
        setStats(null);
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || (err instanceof Error ? err.message : 'Failed to load recovery stats'));
      setStats(null);
      setReportingPeriod(null);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const tableRows = useMemo(() => {
    if (!stats) return [];
    return buildTableRows(stats as Record<string, unknown>);
  }, [stats]);

  const rangeLabel = useMemo(() => {
    const start = reportingPeriod?.start;
    const end = reportingPeriod?.end;
    if (!start && !end) return null;
    const t = reportingPeriod?.type;
    const typeSuffix =
      t && typeof t === 'string'
        ? ` · ${t.charAt(0).toUpperCase() + t.slice(1)}`
        : '';
    return `${start ? fDate(start) : '…'} — ${end ? fDate(end) : '…'}${typeSuffix}`;
  }, [reportingPeriod]);

  const hasTableContent = tableRows.some((r) => r.kind === 'data');
  const showEmpty = !loading && stats && !hasTableContent && !rangeLabel;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Recovery stats
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
        sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Iconify icon="solar:calendar-bold-duotone" width={20} sx={{ color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          Period:
        </Typography>
        {PERIOD_OPTIONS.map(({ value, label }) => (
          <Chip
            key={value}
            size="small"
            label={label}
            onClick={() => {
              setPeriod(value);
              if (value === 'day') setAnchorForPeriod(false);
            }}
            color={period === value ? 'primary' : 'default'}
            variant={period === value ? 'filled' : 'outlined'}
          />
        ))}
        <TextField
          size="small"
          type="date"
          label={period === 'day' ? 'Day (UTC)' : 'Anchor (UTC)'}
          value={atDate}
          onChange={(e) => setAtDate(e.target.value)}
          slotProps={{
            inputLabel: { shrink: true },
            input: { sx: { fontSize: '0.8125rem' } },
          }}
          sx={{ width: 150 }}
        />
        {period !== 'day' && (
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={anchorForPeriod}
                onChange={(_e, c) => setAnchorForPeriod(c)}
              />
            }
            label={<Typography variant="body2">Anchor date</Typography>}
          />
        )}
        <Button
          size="small"
          variant="contained"
          startIcon={<Iconify icon="solar:refresh-bold" width={16} />}
          onClick={fetchStats}
          disabled={loading}
          sx={{ ml: { xs: 0, sm: 'auto' } }}
        >
          Refresh
        </Button>
      </Stack>

      {rangeLabel && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Reporting range (UTC): {rangeLabel}
        </Typography>
      )}

      <Card>
        {loading ? (
          <Box sx={{ p: 2 }}>
            <Skeleton variant="rounded" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={40} />
          </Box>
        ) : (
          <Scrollbar>
            <TableContainer>
              <Table size="small" sx={{ minWidth: 520 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: '55%' }}>Metric</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Value
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map((row, idx) =>
                    row.kind === 'section' ? (
                      <TableRow key={`s-${row.title}-${idx}`}>
                        <TableCell
                          colSpan={2}
                          sx={{
                            bgcolor: 'background.neutral',
                            py: 1.25,
                            borderBottom: 1,
                            borderColor: 'divider',
                          }}
                        >
                          <Typography variant="subtitle2">{row.title}</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={`d-${row.label}-${idx}`} hover>
                        <TableCell sx={{ color: 'text.secondary' }}>{row.label}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {row.value}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        )}
      </Card>

      {showEmpty && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          No stats for this period.
        </Typography>
      )}
    </DashboardContent>
  );
}

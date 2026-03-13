import type { CreditRating } from 'src/_mock/_credit-rating';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import bankAdminService from 'src/redux/services/bank-admin.services';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableEmptyRows } from '../table-empty-rows';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { CreditRatingTableRow } from '../credit-rating-table-row';
import { CreditRatingTableHead } from '../credit-rating-table-head';
import { CreditRatingTableToolbar } from '../credit-rating-table-toolbar';

// ----------------------------------------------------------------------

// Exact API response shapes
type SummaryBucket = { label: string; grade: string; count: number; percent: number };

type CreditRatingOverviewResponse = {
  summary: {
    lowRisk: SummaryBucket;
    moderateRisk: SummaryBucket;
    highRisk: SummaryBucket;
    critical: SummaryBucket;
  };
  tableData: Array<{
    borrower_id: string;
    borrowerName: string;
    borrowerId: string;
    loanAmount: number;
    creditScore: number;
    riskCategory: string;
    riskGrade: string;
    status: string;
  }>;
};

type SummaryState = {
  lowRisk: SummaryBucket;
  moderateRisk: SummaryBucket;
  highRisk: SummaryBucket;
  critical: SummaryBucket;
};

const DEFAULT_BUCKET: SummaryBucket = { label: '', grade: '', count: 0, percent: 0 };

const mapApiToCreditRating = (
  raw: CreditRatingOverviewResponse['tableData'][0],
  index: number
): CreditRating => {
  const cat = raw.riskCategory?.toLowerCase() ?? '';
  let riskCategory: CreditRating['riskCategory'] = 'Moderate Risk';
  if (cat === 'critical') riskCategory = 'Critical';
  else if (cat.includes('high')) riskCategory = 'High Risk';
  else if (cat.includes('low')) riskCategory = 'Low Risk';

  let status: CreditRating['status'] = 'active';
  const s = (raw.status ?? '').toLowerCase();
  if (s === 'inactive' || s === 'rejected') status = 'inactive';
  else if (s === 'under_review' || s === 'pending' || s === 'submitted') status = 'under_review';

  return {
    id: raw.borrowerId || `cr-${index}`,
    borrower_id: raw.borrower_id || 'N/A',
    borrowerName: raw.borrowerName || 'N/A',
    borrowerId: raw.borrowerId || 'N/A',
    loanAmount: raw.loanAmount || 0,
    creditScore: raw.creditScore || 0,
    riskCategory,
    riskGrade: raw.riskGrade ?? '',
    lastAssessment: 'N/A',
    status,
  };
};

export function CreditRatingView() {
  const theme = useTheme();
  const [filterName, setFilterName] = useState('');
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('borrowerName');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [creditRatings, setCreditRatings] = useState<CreditRating[]>([]);
  const [creditRatingSummary, setCreditRatingSummary] = useState<SummaryState>({
    lowRisk: { ...DEFAULT_BUCKET, label: 'Low Risk', grade: 'A' },
    moderateRisk: { ...DEFAULT_BUCKET, label: 'Moderate Risk', grade: 'B' },
    highRisk: { ...DEFAULT_BUCKET, label: 'High Risk', grade: 'C' },
    critical: { ...DEFAULT_BUCKET, label: 'Critical', grade: 'D' },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const HEAD_CELLS = [
    { id: 'borrowerName', label: 'Borrower' },
    { id: 'borrowerId', label: 'Borrower ID' },
    { id: 'loanAmount', label: 'Loan Amount', align: 'right' as const },
    { id: 'creditScore', label: 'Credit Score', align: 'center' as const },
    { id: 'riskCategory', label: 'Risk Category' },
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
      if (checked) {
        const newSelecteds = creditRatings.map((n) => n.id);
        setSelected(newSelecteds);
        return;
      }
      setSelected([]);
    },
    [creditRatings]
  );

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

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  }, []);

  const handleFilterByName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  }, []);

  const fetchCreditRatingOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bankAdminService.getCreditRatingOverview();
      const data: CreditRatingOverviewResponse = response.data?.data ?? response.data;

      if (data?.summary) {
        setCreditRatingSummary({
          lowRisk: data.summary.lowRisk ?? { ...DEFAULT_BUCKET, label: 'Low Risk', grade: 'A' },
          moderateRisk: data.summary.moderateRisk ?? {
            ...DEFAULT_BUCKET,
            label: 'Moderate Risk',
            grade: 'B',
          },
          highRisk: data.summary.highRisk ?? { ...DEFAULT_BUCKET, label: 'High Risk', grade: 'C' },
          critical: data.summary.critical ?? { ...DEFAULT_BUCKET, label: 'Critical', grade: 'D' },
        });
      }

      setCreditRatings(
        Array.isArray(data?.tableData) ? data.tableData.map(mapApiToCreditRating) : []
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch credit rating overview');
      setCreditRatings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCreditRatingOverview();
  }, [fetchCreditRatingOverview]);

  const dataFiltered: CreditRating[] = applyFilter({
    inputData: creditRatings,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4">Credit Ratings Overview</Typography>
        </Stack>

        {/* Summary Cards — one per risk bucket */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {(
            [
              { key: 'lowRisk', icon: 'solar:shield-check-bold-duotone' },
              { key: 'moderateRisk', icon: 'solar:shield-warning-bold-duotone' },
              { key: 'highRisk', icon: 'solar:danger-triangle-bold-duotone' },
              { key: 'critical', icon: 'solar:fire-bold-duotone' },
            ] as const
          ).map(({ key, icon }) => {
            const bucket = creditRatingSummary[key];
            return (
              <Grid key={key} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    p: 2.5,
                    borderTop: 3,
                    borderColor: 'primary.main',
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" color="#000">
                        {bucket.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {bucket.label || key}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          sx={{
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 0.5,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                          }}
                        >
                          Grade {bucket.grade}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {bucket.percent}%
                        </Typography>
                      </Stack>
                    </Box>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <Iconify icon={icon} width={26} sx={{ color: 'primary.main' }} />
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Table Card */}
        <Card>
          <CreditRatingTableToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            onReload={fetchCreditRatingOverview}
          />

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <CreditRatingTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={creditRatings.length}
                  numSelected={selected.length}
                  onSort={handleSort}
                  onSelectAllRows={handleSelectAllRows}
                  headCells={HEAD_CELLS}
                />
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                        <Alert severity="error">{error}</Alert>
                      </TableCell>
                    </TableRow>
                  ) : dataFiltered.length > 0 ? (
                    <>
                      {dataFiltered
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                          <CreditRatingTableRow
                            key={row.id}
                            row={row}
                            selected={selected.includes(row.id)}
                            onSelectRow={() => handleSelectRow(row.id)}
                          />
                        ))}

                      <TableEmptyRows
                        height={68}
                        emptyRows={emptyRows(page, rowsPerPage, creditRatings.length)}
                      />
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          {notFound
                            ? `No credit ratings found for "${filterName}"`
                            : 'No credit ratings found'}
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
            count={creditRatings.length}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </DashboardContent>
  );
}

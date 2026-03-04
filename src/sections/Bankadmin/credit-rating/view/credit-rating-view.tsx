import type { CreditRating } from 'src/_mock/_credit-rating';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { Scrollbar } from 'src/components/scrollbar';

import bankAdminService from 'src/redux/services/bank-admin.services';

import { TableNoData } from '../table-no-data';
import { TableEmptyRows } from '../table-empty-rows';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { CreditRatingTableRow } from '../credit-rating-table-row';
import { CreditRatingTableHead } from '../credit-rating-table-head';
import { CreditRatingTableToolbar } from '../credit-rating-table-toolbar';

// ----------------------------------------------------------------------

// API Response Types
type CreditRatingApiResponse = {
  borrowerName: string;
  borrowerId: string;
  loanAmount: number;
  creditScore: number;
  riskCategory: string;
  status: string;
  customerCnic?: string;
  customerEmail?: string;
  loanApplicationStatus?: string;
};

type CreditRatingOverviewResponse = {
  message: string;
  summary: {
    totalBorrowers: number;
    riskDistribution: {
      highRisk: number;
      moderateRisk: number;
      lowRisk: number;
    };
  };
  tableData: CreditRatingApiResponse[];
};

// Map API response to CreditRating type
const mapApiToCreditRating = (apiData: CreditRatingApiResponse, index: number): CreditRating => {
  // Map risk category to match type
  let riskCategory: 'High Risk' | 'Moderate Risk' | 'Low Risk' = 'Moderate Risk';
  if (apiData.riskCategory?.toLowerCase().includes('high')) {
    riskCategory = 'High Risk';
  } else if (apiData.riskCategory?.toLowerCase().includes('low')) {
    riskCategory = 'Low Risk';
  }

  // Map status to match type
  let status: 'active' | 'inactive' | 'under_review' = 'active';
  const statusLower = (apiData.status || apiData.loanApplicationStatus || '').toLowerCase();
  if (statusLower === 'inactive' || statusLower === 'rejected') {
    status = 'inactive';
  } else if (statusLower === 'under_review' || statusLower === 'pending' || statusLower === 'submitted') {
    status = 'under_review';
  }

  return {
    id: apiData.borrowerId || `credit-rating-${index}`,
    borrowerName: apiData.borrowerName || 'N/A',
    borrowerId: apiData.borrowerId || 'N/A',
    loanAmount: apiData.loanAmount || 0,
    creditScore: apiData.creditScore || 0,
    riskCategory,
    lastAssessment: 'N/A', // API doesn't provide this field
    status,
  };
};

export function CreditRatingView() {
  const [filterName, setFilterName] = useState('');
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('borrowerName');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [creditRatings, setCreditRatings] = useState<CreditRating[]>([]);
  const [creditRatingSummary, setCreditRatingSummary] = useState({
    highRisk: 0,
    moderateRisk: 0,
    lowRisk: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const HEAD_CELLS = [
    { id: 'borrowerName', label: 'Borrower Name' },
    { id: 'borrowerId', label: 'Borrower ID' },
    { id: 'loanAmount', label: 'Loan Amount', align: 'right' as const },
    { id: 'creditScore', label: 'Credit Score', align: 'center' as const },
    { id: 'riskCategory', label: 'Risk Category' },
    { id: 'lastAssessment', label: 'Last Assessment' },
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

  // Fetch credit rating overview data
  const fetchCreditRatingOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bankAdminService.getCreditRatingOverview();
      if (response.status === 200) {
        const data: CreditRatingOverviewResponse =
          response.data?.data || response.data;

        // Update summary
        if (data.summary?.riskDistribution) {
          setCreditRatingSummary({
            highRisk: data.summary.riskDistribution.highRisk || 0,
            moderateRisk: data.summary.riskDistribution.moderateRisk || 0,
            lowRisk: data.summary.riskDistribution.lowRisk || 0,
            total: data.summary.totalBorrowers || 0,
          });
        }

        // Map and update table data
        if (data.tableData && Array.isArray(data.tableData)) {
          const mappedData = data.tableData.map((item, index) =>
            mapApiToCreditRating(item, index)
          );
          setCreditRatings(mappedData);
        } else {
          setCreditRatings([]);
        }
      }
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

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ color: 'error.main' }}>
                    {creditRatingSummary.highRisk.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                    High Risk
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    bgcolor: (theme) => theme.palette.error.lighter,
                  }}
                >
                  <Typography variant="h4" sx={{ color: 'error.main' }}>
                    ⚠️
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ color: 'warning.main' }}>
                    {creditRatingSummary.moderateRisk.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                    Moderate Risk
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    bgcolor: (theme) => theme.palette.warning.lighter,
                  }}
                >
                  <Typography variant="h4" sx={{ color: 'warning.main' }}>
                    ⚡
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ color: 'success.main' }}>
                    {creditRatingSummary.lowRisk.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                    Low Risk
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    bgcolor: (theme) => theme.palette.success.lighter,
                  }}
                >
                  <Typography variant="h4" sx={{ color: 'success.main' }}>
                    ✓
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Table Card */}
        <Card>
          <CreditRatingTableToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
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

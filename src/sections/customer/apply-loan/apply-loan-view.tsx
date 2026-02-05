import type { CustomerLoanApplication } from 'src/_mock/_customer-loan-application';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';

import { DashboardContent } from 'src/layouts/dashboard';
import { _customerLoanApplications } from 'src/_mock/_customer-loan-application';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const calculateInstallment = (loanAmount: number): number => {
  // Simple calculation: Loan amount / 24 months (2 years)
  // In real scenario, this would include interest rate
  if (!loanAmount || loanAmount <= 0) return 0;
  return Math.round(loanAmount / 24);
};

export function ApplyLoanView() {
  const [applications, setApplications] = useState<CustomerLoanApplication[]>(_customerLoanApplications);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    fatherName: '',
    cnic: '',
    city: '',
    region: '',
    loanAmount: '',
    businessIncome: '',
    investmentIncome: '',
    salaryIncome: '',
    houseRental: '',
    carRental: '',
    utilitiesBill: '',
    installmentsOther: '',
    fuelExpenses: '',
    groceryExpenses: '',
    medicalBills: '',
    insurance: '',
    fees: '',
    otherExpenses: '',
    miscellaneous: '',
  });

  const installmentAmount = useMemo(() => {
    const amount = parseFloat(formData.loanAmount) || 0;
    return calculateInstallment(amount);
  }, [formData.loanAmount]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenDialog = (id?: string) => {
    if (id) {
      const application = applications.find((app) => app.id === id);
      if (application) {
        setFormData({
          customerName: application.customerName,
          fatherName: application.fatherName,
          cnic: application.cnic,
          city: application.city,
          region: application.region,
          loanAmount: application.loanAmount.toString(),
          businessIncome: application.businessIncome.toString(),
          investmentIncome: application.investmentIncome.toString(),
          salaryIncome: application.salaryIncome.toString(),
          houseRental: application.houseRental.toString(),
          carRental: application.carRental.toString(),
          utilitiesBill: application.utilitiesBill.toString(),
          installmentsOther: application.installmentsOther.toString(),
          fuelExpenses: application.fuelExpenses.toString(),
          groceryExpenses: application.groceryExpenses.toString(),
          medicalBills: application.medicalBills.toString(),
          insurance: application.insurance.toString(),
          fees: application.fees.toString(),
          otherExpenses: application.otherExpenses.toString(),
          miscellaneous: application.miscellaneous.toString(),
        });
        setEditingId(id);
      }
    } else {
      setFormData({
        customerName: '',
        fatherName: '',
        cnic: '',
        city: '',
        region: '',
        loanAmount: '',
        businessIncome: '',
        investmentIncome: '',
        salaryIncome: '',
        houseRental: '',
        carRental: '',
        utilitiesBill: '',
        installmentsOther: '',
        fuelExpenses: '',
        groceryExpenses: '',
        medicalBills: '',
        insurance: '',
        fees: '',
        otherExpenses: '',
        miscellaneous: '',
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    const newApplication: CustomerLoanApplication = {
      id: editingId || `APP-${String(applications.length + 1).padStart(3, '0')}`,
      customerName: formData.customerName,
      fatherName: formData.fatherName,
      cnic: formData.cnic,
      city: formData.city,
      region: formData.region,
      loanAmount: parseFloat(formData.loanAmount) || 0,
      installmentAmount,
      businessIncome: parseFloat(formData.businessIncome) || 0,
      investmentIncome: parseFloat(formData.investmentIncome) || 0,
      salaryIncome: parseFloat(formData.salaryIncome) || 0,
      houseRental: parseFloat(formData.houseRental) || 0,
      carRental: parseFloat(formData.carRental) || 0,
      utilitiesBill: parseFloat(formData.utilitiesBill) || 0,
      installmentsOther: parseFloat(formData.installmentsOther) || 0,
      fuelExpenses: parseFloat(formData.fuelExpenses) || 0,
      groceryExpenses: parseFloat(formData.groceryExpenses) || 0,
      medicalBills: parseFloat(formData.medicalBills) || 0,
      insurance: parseFloat(formData.insurance) || 0,
      fees: parseFloat(formData.fees) || 0,
      otherExpenses: parseFloat(formData.otherExpenses) || 0,
      miscellaneous: parseFloat(formData.miscellaneous) || 0,
      status: editingId ? 'draft' : 'submitted',
      createdAt: editingId 
        ? applications.find((app) => app.id === editingId)?.createdAt || new Date().toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (editingId) {
      setApplications((prev) => prev.map((app) => (app.id === editingId ? newApplication : app)));
    } else {
      setApplications((prev) => [...prev, newApplication]);
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'under_review':
        return 'warning';
      case 'submitted':
        return 'info';
      default:
        return 'default';
    }
  };

  const totalIncome = useMemo(
    () =>
      (parseFloat(formData.businessIncome) || 0) +
      (parseFloat(formData.investmentIncome) || 0) +
      (parseFloat(formData.salaryIncome) || 0) +
      (parseFloat(formData.houseRental) || 0) +
      (parseFloat(formData.carRental) || 0),
    [formData.businessIncome, formData.investmentIncome, formData.salaryIncome, formData.houseRental, formData.carRental]
  );

  const totalExpenses = useMemo(
    () =>
      (parseFloat(formData.utilitiesBill) || 0) +
      (parseFloat(formData.installmentsOther) || 0) +
      (parseFloat(formData.fuelExpenses) || 0) +
      (parseFloat(formData.groceryExpenses) || 0) +
      (parseFloat(formData.medicalBills) || 0) +
      (parseFloat(formData.insurance) || 0) +
      (parseFloat(formData.fees) || 0) +
      (parseFloat(formData.otherExpenses) || 0) +
      (parseFloat(formData.miscellaneous) || 0),
    [
      formData.utilitiesBill,
      formData.installmentsOther,
      formData.fuelExpenses,
      formData.groceryExpenses,
      formData.medicalBills,
      formData.insurance,
      formData.fees,
      formData.otherExpenses,
      formData.miscellaneous,
    ]
  );

  const netCashflow = totalIncome - totalExpenses;

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Apply for Loan</Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => handleOpenDialog()}
            >
              New Application
            </Button>
          </Stack>

          {/* Applications Table */}
          <Card>
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Application ID</TableCell>
                      <TableCell>Customer Name</TableCell>
                      <TableCell>CNIC</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>Loan Amount</TableCell>
                      <TableCell>Installment Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id} hover>
                        <TableCell>{application.id}</TableCell>
                        <TableCell>{application.customerName}</TableCell>
                        <TableCell>{application.cnic}</TableCell>
                        <TableCell>{application.city}</TableCell>
                        <TableCell>
                          PKR {application.loanAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          PKR {application.installmentAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={application.status.replace('_', ' ').toUpperCase()}
                            color={getStatusColor(application.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(application.id)}
                          >
                            <Iconify icon="eva:edit-fill" />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(application.id)}
                          >
                            <Iconify icon="eva:trash-2-fill" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Card>

          {/* Form Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
            <form onSubmit={handleSubmit}>
              <DialogTitle>
                {editingId ? 'Edit Loan Application' : 'New Loan Application'}
              </DialogTitle>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  {/* Basic Information */}
                  <Card>
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ mb: 3 }}>
                        Basic Information
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Customer Name"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            required
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Father Name"
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleChange}
                            required
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="CNIC"
                            name="cnic"
                            value={formData.cnic}
                            onChange={handleChange}
                            placeholder="42301-1234567-8"
                            required
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Region"
                            name="region"
                            value={formData.region}
                            onChange={handleChange}
                            required
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Loan Amount"
                            name="loanAmount"
                            type="number"
                            value={formData.loanAmount}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                            required
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Installment Amount"
                            value={installmentAmount.toLocaleString()}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                            disabled
                            helperText="Auto-calculated based on loan amount"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>

                  <Divider />

                  {/* Income Section */}
                  <Card>
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ mb: 3 }}>
                        Personal and Family Cashflows - Income
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Business Income"
                            name="businessIncome"
                            type="number"
                            value={formData.businessIncome}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Investment Income"
                            name="investmentIncome"
                            type="number"
                            value={formData.investmentIncome}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Salary Income"
                            name="salaryIncome"
                            type="number"
                            value={formData.salaryIncome}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="House Rental"
                            name="houseRental"
                            type="number"
                            value={formData.houseRental}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Car Rental"
                            name="carRental"
                            type="number"
                            value={formData.carRental}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Total Income"
                            value={totalIncome.toLocaleString()}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                            disabled
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>

                  <Divider />

                  {/* Expenses Section */}
                  <Card>
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ mb: 3 }}>
                        Personal and Family Cashflows - Expenses
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Utilities Bill"
                            name="utilitiesBill"
                            type="number"
                            value={formData.utilitiesBill}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Installments (other than this loan)"
                            name="installmentsOther"
                            type="number"
                            value={formData.installmentsOther}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Fuel Expenses"
                            name="fuelExpenses"
                            type="number"
                            value={formData.fuelExpenses}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Grocery Expenses"
                            name="groceryExpenses"
                            type="number"
                            value={formData.groceryExpenses}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Medical Bills"
                            name="medicalBills"
                            type="number"
                            value={formData.medicalBills}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Insurance"
                            name="insurance"
                            type="number"
                            value={formData.insurance}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Fees"
                            name="fees"
                            type="number"
                            value={formData.fees}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Other (other than this loan)"
                            name="otherExpenses"
                            type="number"
                            value={formData.otherExpenses}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Miscellaneous"
                            name="miscellaneous"
                            type="number"
                            value={formData.miscellaneous}
                            onChange={handleChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Total Expenses"
                            value={totalExpenses.toLocaleString()}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                            disabled
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Net Cashflow"
                            value={netCashflow.toLocaleString()}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                            disabled
                            sx={{
                              '& .MuiInputBase-input': {
                                color: netCashflow >= 0 ? 'success.main' : 'error.main',
                                fontWeight: 'bold',
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button type="submit" variant="contained">
                  {editingId ? 'Update Application' : 'Submit Application'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Stack>
      </Container>
    </DashboardContent>
  );
}

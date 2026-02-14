import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import bankService from 'src/redux/services/bank.services';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type BankFormViewProps = {
  bankId?: string;
};

export function BankFormView({ bankId }: BankFormViewProps) {
  const router = useRouter();
  const isEditMode = !!bankId;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    code: '',
    registrationNumber: '',
    taxId: '',
    licenseNumber: '',
    bankType: '',
    establishedDate: '',
    capitalAmount: '',

    // Contact Information
    email: '',
    phone: '',
    website: '',
    fax: '',

    // Address Information
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',

    // Admin Credentials (only for new banks)
    adminEmail: '',
    password: '',
    confirmPassword: '',

    // Status
    status: 'active',
  });

  // Fetch bank data if editing
  useEffect(() => {
    const fetchBank = async () => {
      if (!bankId) return;

      try {
        setFetching(true);
        setError(null);
        const response = await bankService.getBankById(bankId);
        console.log('response', response);
        const bank = response.data?.bank;

        if (bank) {
          setFormData({
            name: bank.name || '',
            code: bank.code || '',
            registrationNumber: bank.registrationNumber || '',
            taxId: bank.taxId || '',
            licenseNumber: bank.licenseNumber || '',
            bankType: bank.bankType || '',
            establishedDate: bank.establishedDate || '',
            capitalAmount: bank.capitalAmount || '',
            email: bank.email || '',
            phone: bank.phone || '',
            website: bank.website || '',
            fax: bank.fax || '',
            address: bank.address || '',
            city: bank.city || '',
            state: bank.state || '',
            zipCode: bank.zipCode || '',
            country: bank.country || '',
            adminEmail: bank.adminEmail || '',
            password: '',
            confirmPassword: '',
            status: bank.status || 'active',
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch bank data');
      } finally {
        setFetching(false);
      }
    };

    fetchBank();
  }, [bankId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Bank name is required');
      return false;
    }
    if (!formData.code.trim()) {
      setError('Bank code is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone is required');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }

    // Password validation for new banks only
    if (!isEditMode) {
      if (!formData.adminEmail.trim()) {
        setError('Admin email is required');
        return false;
      }
      if (!formData.password.trim()) {
        setError('Password is required');
        return false;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bankPayload: any = {
        name: formData.name,
        code: formData.code,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        status: formData.status,
        capitalAmount: formData.capitalAmount,
      };

      // Add optional fields if provided
      if (formData.registrationNumber) bankPayload.registrationNumber = formData.registrationNumber;
      if (formData.taxId) bankPayload.taxId = formData.taxId;
      if (formData.licenseNumber) bankPayload.licenseNumber = formData.licenseNumber;
      if (formData.bankType) bankPayload.bankType = formData.bankType;
      if (formData.establishedDate) bankPayload.establishedDate = formData.establishedDate;
      if (formData.capitalAmount) bankPayload.capitalAmount = formData.capitalAmount;
      if (formData.website) bankPayload.website = formData.website;
      if (formData.fax) bankPayload.fax = formData.fax;
      if (formData.city) bankPayload.city = formData.city;
      if (formData.state) bankPayload.state = formData.state;
      if (formData.zipCode) bankPayload.zipCode = formData.zipCode;
      if (formData.country) bankPayload.country = formData.country;

      // Add admin credentials for new banks
      if (!isEditMode) {
        bankPayload.adminEmail = formData.adminEmail;
        bankPayload.password = formData.password;
      }

      if (isEditMode && bankId) {
        await bankService.updateBank(bankId, bankPayload);
      } else {
        await bankService.addBank(bankPayload);
      }

      // Navigate back to bank management
      router.push('/bank-management');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save bank';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
              <Iconify icon="eva:arrow-back-fill" />
            </IconButton>
            <Typography variant="h4">{isEditMode ? 'Edit Bank' : 'Register New Bank'}</Typography>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: 'error.lighter',
              color: 'error.darker',
            }}
          >
            {error}
          </Box>
        )}

        {/* Form Card */}
        <Card sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              {/* Basic Information Section */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, pb: 1, borderBottom: 1, borderColor: 'divider' }}
                >
                  Basic Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Bank Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="National Microfinance Bank"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Bank Code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="NMB001"
                      helperText="Unique identifier for the bank"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Registration Number"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="REG-2024-001"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Tax ID / NTN"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      placeholder="1234567-8"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="License Number"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      placeholder="LIC-2024-001"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      select
                      label="Bank Type"
                      name="bankType"
                      value={formData.bankType}
                      onChange={handleChange}
                    >
                      <MenuItem value="">Select Type</MenuItem>
                      <MenuItem value="commercial">Commercial Bank</MenuItem>
                      <MenuItem value="microfinance">Microfinance Bank</MenuItem>
                      <MenuItem value="islamic">Islamic Bank</MenuItem>
                      <MenuItem value="development">Development Bank</MenuItem>
                      <MenuItem value="savings">Savings Bank</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Capital Amount"
                      name="capitalAmount"
                      value={formData.capitalAmount}
                      onChange={handleChange}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      The amount of money the bank has in its reserves.
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Established Date"
                      name="establishedDate"
                      value={formData.establishedDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Contact Information Section */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, pb: 1, borderBottom: 1, borderColor: 'divider' }}
                >
                  Contact Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      type="email"
                      label="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="info@bank.com"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+92 300 1234567"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="url"
                      label="Website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://www.bank.com"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Fax Number"
                      name="fax"
                      value={formData.fax}
                      onChange={handleChange}
                      placeholder="+92 21 1234567"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Address Information Section */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, pb: 1, borderBottom: 1, borderColor: 'divider' }}
                >
                  Address Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      required
                      label="Street Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      multiline
                      rows={2}
                      placeholder="123 Main Street"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Karachi"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="State / Province"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Sindh"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Zip / Postal Code"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="75000"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Pakistan"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Admin Credentials Section (only for new banks) */}
              {!isEditMode && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, pb: 1, borderBottom: 1, borderColor: 'divider' }}
                  >
                    Admin Credentials
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Create login credentials for the bank administrator
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required
                        type="email"
                        label="Admin Email"
                        name="adminEmail"
                        value={formData.adminEmail}
                        onChange={handleChange}
                        placeholder="admin@bank.com"
                        helperText="This will be used for bank admin login"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                <Iconify
                                  icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        helperText="Minimum 8 characters"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required
                        type={showConfirmPassword ? 'text' : 'password'}
                        label="Confirm Password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                <Iconify
                                  icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Status Section */}
              <Box>
                {/* <Typography
                  variant="h6"
                  sx={{ mb: 3, pb: 1, borderBottom: 1, borderColor: 'divider' }}
                >
                  Status
                </Typography> */}
                {/* <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      select
                      required
                      label="Status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                    </TextField>
                  </Grid>
                </Grid> */}
              </Box>

              {/* Action Buttons */}
              <Box display="flex" gap={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                <Button variant="outlined" onClick={() => router.back()} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Iconify icon="eva:save-fill" />
                  }
                >
                  {loading ? 'Saving...' : isEditMode ? 'Update Bank' : 'Register Bank'}
                </Button>
              </Box>
            </Stack>
          </form>
        </Card>
      </Stack>
    </DashboardContent>
  );
}

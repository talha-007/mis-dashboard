import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import borrowerService from 'src/redux/services/borrowServices';
import { toast } from 'react-toastify';

// Borrower status options
const BORROWER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

// Borrower rating options
const BORROWER_RATING_OPTIONS = [
  { value: 'A', label: 'A - Excellent' },
  { value: 'B', label: 'B - Good' },
  { value: 'C', label: 'C - Fair' },
  { value: 'D', label: 'D - Poor' },
];

export interface BorrowerFormData {
  name: string;
  email: string;
  phone: string;
  loanAmount: number;
  status: string;
  rating: string;
  address: string;
}

interface BorrowerFormViewProps {
  isEdit?: boolean;
  initialData?: BorrowerFormData;
}

export function BorrowerFormView({ isEdit = false, initialData }: BorrowerFormViewProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<BorrowerFormData>(
    initialData || {
      name: '',
      email: '',
      phone: '',
      loanAmount: 0,
      status: 'active',
      rating: 'C',
      address: '',
    }
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
      const { name, value } = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'loanAmount' ? parseFloat(value as string) : value,
      }));
      setError(null);
    },
    []
  );

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Borrower name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (formData.loanAmount <= 0) {
      setError('Loan amount must be greater than 0');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit && id) {
        await borrowerService.update(id, formData);
        toast.success('Borrower updated successfully!');
      } else {
        await borrowerService.create(formData);
        toast.success('Borrower created successfully!');
      }

      navigate('/borrower-management');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/borrower-management');
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          onClick={handleCancel}
          color="inherit"
          variant="text"
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {isEdit ? 'Edit Borrower' : 'Add Borrower'}
        </Typography>
      </Box>

      <Card sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Row 1: Name and Email */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Borrower Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter borrower name"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </Stack>

            {/* Row 2: Phone and Loan Amount */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
              <TextField
                fullWidth
                label="Loan Amount"
                name="loanAmount"
                type="number"
                value={formData.loanAmount}
                onChange={handleChange}
                placeholder="0.00"
                inputProps={{ step: '0.01', min: '0' }}
                required
              />
            </Stack>

            {/* Row 3: Status and Rating */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {BORROWER_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
              >
                {BORROWER_RATING_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* Address */}
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full address"
              multiline
              rows={3}
              required
            />

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                color="primary"
                loading={isLoading}
                type="submit"
                startIcon={<Iconify icon="eva:save-fill" />}
              >
                {isEdit ? 'Update Borrower' : 'Add Borrower'}
              </LoadingButton>
            </Stack>
          </Stack>
        </Box>
      </Card>
    </DashboardContent>
  );
}

import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { DashboardContent } from 'src/layouts/dashboard';
import usersService from 'src/redux/services/users.services';

import { Iconify } from 'src/components/iconify';

interface UsersFormViewProps {
  isEdit?: boolean;
  initialData?: any;
}

export function UsersFormView({ isEdit = false, initialData }: UsersFormViewProps) {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'staff',
    status: 'active',
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        role: initialData.role || 'staff',
        status: initialData.status || 'active',
      });
    }
  }, [initialData]);

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit && userId) {
        await usersService.update(userId, formData);
        toast.success('User updated successfully!');
      } else {
        await usersService.create(formData);
        toast.success('User created successfully!');
      }

      navigate('/users-management');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleCancel = () => {
    navigate('/users-management');
  };

  return (
    <DashboardContent>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          {isEdit ? 'Edit User' : 'Add New User'}
        </Typography>
      </Box>

      <Card
        sx={{
          p: 3,
          boxShadow: (theme) => theme.shadows[1],
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {error && (
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{ mb: 2 }}
              >
                {error}
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                disabled={isLoading}
                size="small"
              />
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
                disabled={isLoading}
                size="small"
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
                disabled={isLoading}
                size="small"
              />
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1234567890"
                disabled={isLoading}
                size="small"
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={isLoading}
                size="small"
              >
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="supervisor">Supervisor</MenuItem>
              </TextField>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={isLoading}
                size="small"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isLoading}
                startIcon={<Iconify icon={isEdit ? 'eva:edit-fill' : 'eva:plus-fill'} />}
              >
                {isEdit ? 'Update User' : 'Create User'}
              </LoadingButton>
            </Stack>
          </Stack>
        </form>
      </Card>
    </DashboardContent>
  );
}

import { toast } from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LoadingButton from '@mui/lab/LoadingButton';

import { useAppSelector } from 'src/store';
import { UserRole } from 'src/types/auth.types';
import { DashboardContent } from 'src/layouts/dashboard';
import employeeService from 'src/redux/services/employee.services';
import usersService from 'src/redux/services/users.services';

import { Iconify } from 'src/components/iconify';

// CNIC format: 12345-6789012-3
const sanitizeCnic = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
};

interface UsersFormViewProps {
  isEdit?: boolean;
  initialData?: any;
}

export function UsersFormView({ isEdit = false, initialData }: UsersFormViewProps) {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAppSelector((state) => state.auth);
  const isEmployee = user?.role === UserRole.RECOVERY_OFFICER;
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type FormDataState = {
    name: string;
    lastname: string;
    email: string;
    phone: string;
    cnic: string;
    password: string;
  };
  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    lastname: '',
    email: '',
    phone: '',
    cnic: '',
    password: '',
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || initialData.firstName || '',
        lastname: initialData.lastname || initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        cnic: initialData.cnic || '',
        password: '',
      });
    }
  }, [initialData]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.lastname.trim()) {
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
    if (!formData.cnic.trim()) {
      setError('CNIC is required');
      return false;
    }
    if (!/^\d{5}-\d{7}-\d{1}$/.test(formData.cnic)) {
      setError('CNIC must be in format 12345-6789012-3');
      return false;
    }
    if (!isEdit && !formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    if (!isEdit && formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (isEdit && formData.password && formData.password.length < 8) {
      setError('Password must be at least 8 characters');
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
      const payload: Record<string, string> = {
        name: formData.name.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        cnic: formData.cnic.trim(),
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      if (isEdit && userId) {
        if (isEmployee) {
          await employeeService.updateCustomer(userId, payload);
        } else {
          await usersService.update(userId, payload);
        }
        toast.success('User updated successfully!');
      } else {
        if (isEmployee) {
          await employeeService.createCustomer(payload);
        } else {
          await usersService.create(payload);
        }
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

  const handleCnicChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev: FormDataState) => ({
        ...prev,
        cnic: sanitizeCnic(e.target.value),
      }));
      setError(null);
    },
    []
  );

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
          {isEdit ? 'Edit Customer' : 'Add New Customer'}
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
              <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                required
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter name"
                disabled={isLoading}
                size="small"
              />
              <TextField
                fullWidth
                required
                label="Last Name"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                placeholder="Enter last name"
                disabled={isLoading}
                size="small"
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                required
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
                required
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+92 300 1234567"
                disabled={isLoading}
                size="small"
              />
            </Stack>

            <TextField
              fullWidth
              required
              label="CNIC"
              name="cnic"
              value={formData.cnic}
              onChange={handleCnicChange}
              placeholder="12345-6789012-3"
              disabled={isLoading}
              size="small"
              inputProps={{ maxLength: 15 }}
              helperText="Format: 12345-6789012-3"
            />

            <TextField
              fullWidth
              required={!isEdit}
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              placeholder={isEdit ? 'Leave blank to keep current' : 'Min 8 characters'}
              disabled={isLoading}
              size="small"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        aria-label="toggle password"
                      >
                        <Iconify
                          icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          width={20}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              helperText={isEdit ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
            />

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
                {isEdit ? 'Update Customer' : 'Create Customer'}
              </LoadingButton>
            </Stack>
          </Stack>
        </form>
      </Card>
    </DashboardContent>
  );
}

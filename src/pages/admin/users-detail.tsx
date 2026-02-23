import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import usersService from 'src/redux/services/users.services';

import { Iconify } from 'src/components/iconify';

interface DetailRowProps {
  label: string;
  value: string | number | boolean;
  isChip?: boolean;
  chipColor?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

function DetailRow({ label, value, isChip = false, chipColor = 'default' }: DetailRowProps) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 150, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-word' }}>
        {isChip ? (
          <Chip
            label={String(value)}
            size="small"
            variant="outlined"
            sx={{
              backgroundColor:
                chipColor === 'success'
                  ? 'rgba(76, 175, 80, 0.1)'
                  : chipColor === 'warning'
                    ? 'rgba(255, 193, 7, 0.1)'
                    : chipColor === 'error'
                      ? 'rgba(244, 67, 54, 0.1)'
                      : chipColor === 'info'
                        ? 'rgba(33, 150, 243, 0.1)'
                        : 'rgba(158, 158, 158, 0.1)',
              color:
                chipColor === 'success'
                  ? '#4caf50'
                  : chipColor === 'warning'
                    ? '#ffc107'
                    : chipColor === 'error'
                      ? '#f44336'
                      : chipColor === 'info'
                        ? '#2196f3'
                        : '#9e9e9e',
              borderColor:
                chipColor === 'success'
                  ? '#4caf50'
                  : chipColor === 'warning'
                    ? '#ffc107'
                    : chipColor === 'error'
                      ? '#f44336'
                      : chipColor === 'info'
                        ? '#2196f3'
                        : '#9e9e9e',
            }}
          />
        ) : (
          value
        )}
      </Typography>
    </Stack>
  );
}

export default function Page() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError('User ID not found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await usersService.get(userId);
        setUserData(response.data.user);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load user';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (isLoading) {
    return (
      <>
        <title>{`User Details - ${CONFIG.appName}`}</title>
        <DashboardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            <CircularProgress />
          </Box>
        </DashboardContent>
      </>
    );
  }

  if (error || !userData) {
    return (
      <>
        <title>{`User Details - ${CONFIG.appName}`}</title>
        <DashboardContent>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">{error || 'Failed to load user data'}</Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/users-management')}
              sx={{ mt: 2 }}
            >
              Back to Users
            </Button>
          </Box>
        </DashboardContent>
      </>
    );
  }

  return (
    <>
      <title>{`User Details - ${CONFIG.appName}`}</title>
      <DashboardContent>
        <Stack spacing={3}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Stack>
              <Typography variant="h4" fontWeight={700}>
                User Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                View complete information about this user
              </Typography>
            </Stack>
            {/* <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="eva:edit-fill" />}
                onClick={() => navigate(`/users-management/edit/${userId}`)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/users-management')}
              >
                Back
              </Button>
            </Stack> */}
          </Box>

          {/* Personal Information */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Personal Information
            </Typography>
            <DetailRow
              label="Full Name"
              value={userData.fullName || `${userData.name} ${userData.lastname}`}
            />
            <DetailRow label="First Name" value={userData.name} />
            <DetailRow label="Last Name" value={userData.lastname} />
            <DetailRow label="Email" value={userData.email} />
          </Card>

          {/* Contact Information */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Contact Information
            </Typography>
            <DetailRow label="Phone" value={userData.phone || 'Not provided'} />
            <DetailRow label="CNIC" value={userData.cnic || 'Not provided'} />
          </Card>

          {/* User Identifiers */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              User Identifiers
            </Typography>
            <DetailRow label="User ID" value={userData.userId} />
            <DetailRow label="Record ID" value={userData.id} />
            <DetailRow label="Slug" value={userData.slug} />
          </Card>

          {/* Account Status */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Account Status
            </Typography>
            <DetailRow
              label="OTP Verification"
              value={userData.isOtpVerified ? 'Verified' : 'Not Verified'}
              isChip
              chipColor={userData.isOtpVerified ? 'success' : 'warning'}
            />
            <DetailRow
              label="Login Type"
              value={userData.isGoogleLogin ? 'Google Login' : 'Email/Password'}
              isChip
              chipColor={userData.isGoogleLogin ? 'info' : 'default'}
            />
            <DetailRow
              label="Loan Applied"
              value={userData.loanApplied ? 'Yes' : 'No'}
              isChip
              chipColor={userData.loanApplied ? 'success' : 'default'}
            />
            <DetailRow label="Rating" value={`${userData.rating || 0} / 5`} />
          </Card>

          {/* Timestamps */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Record Information
            </Typography>
            <DetailRow label="Created At" value={new Date(userData.createdAt).toLocaleString()} />
            <DetailRow label="Updated At" value={new Date(userData.updatedAt).toLocaleString()} />
          </Card>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="eva:edit-fill" />}
              onClick={() => navigate(`/users-management/edit/${userId}`)}
            >
              Edit User
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/users-management')}
            >
              Back to List
            </Button>
          </Stack>
        </Stack>
      </DashboardContent>
    </>
  );
}

import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/config-global';
import usersService from 'src/redux/services/users.services';

import { UsersFormView } from 'src/sections/users/users-form-view';

export default function Page() {
  const { userId } = useParams();
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
        const data = response.data;
        setUserData(data);
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
        <title>{`Edit User - ${CONFIG.appName}`}</title>
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
      </>
    );
  }

  if (error || !userData) {
    return (
      <>
        <title>{`Edit User - ${CONFIG.appName}`}</title>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error || 'Failed to load user data'}</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <title>{`Edit User - ${CONFIG.appName}`}</title>
      <UsersFormView isEdit initialData={userData} />
    </>
  );
}

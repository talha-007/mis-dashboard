import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import borrowerService from 'src/redux/services/borrowServices';

import { BorrowerFormView } from 'src/sections/borrower/borrower-form-view';

export default function BorrowerEditPage() {
  const { id } = useParams();
  const [borrowerData, setBorrowerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBorrower = async () => {
      if (!id) {
        setError('Borrower ID not found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await borrowerService.get(id);
        const data = response.data;

        setBorrowerData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          loanAmount: data.loanAmount,
          status: data.status,
          rating: data.rating,
          address: data.address,
        });
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load borrower';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBorrower();
  }, [id]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !borrowerData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error || 'Failed to load borrower data'}</Typography>
      </Box>
    );
  }

  return <BorrowerFormView isEdit initialData={borrowerData} />;
}

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import customerService from 'src/redux/services/customer.services';

// ----------------------------------------------------------------------

type CreditRating = {
  rating: number;
  status: string;
};

export function CustomerCreditRatingView() {
  const [rating, setRating] = useState<CreditRating | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await customerService.getMyCreditRating();
        const body = res.data?.data ?? res.data;
        const ratingValue = Number(body?.rating ?? 0);
        const statusValue = String(body?.status ?? 'N/A');

        setRating({
          rating: ratingValue,
          status: statusValue,
        });
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load credit rating');
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, []);

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Credit Rating
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ maxWidth: 500, mx: 'auto' }}>
            {error}
          </Alert>
        ) : !rating ? (
          <Alert severity="info" sx={{ maxWidth: 500, mx: 'auto' }}>
            No credit rating found.
          </Alert>
        ) : (
          <Card sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Rating
              </Typography>
              <Typography variant="h4">{rating.rating}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Risk
              </Typography>
              <Typography variant="h4">{rating.status}</Typography>
            </Box>
          </Card>
        )}
      </Container>
    </DashboardContent>
  );
}

/**
 * Unauthorized Page
 * Shown when user doesn't have permission to access a resource
 */

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Unauthorized - MIS Dashboard</title>
      </Helmet>

      <Container>
        <Box
          sx={{
            py: 12,
            maxWidth: 480,
            mx: 'auto',
            display: 'flex',
            minHeight: '100vh',
            textAlign: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h3" sx={{ mb: 3 }}>
            Access Denied
          </Typography>

          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            You don&apos;t have permission to access this page.
            <br />
            Please contact your administrator if you believe this is a mistake.
          </Typography>

          <Box
            component="img"
            src="/assets/illustrations/illustration-404.svg"
            sx={{
              width: 260,
              height: 'auto',
              my: { xs: 5, sm: 8 },
            }}
          />

          <Button
            size="large"
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-ios-back-outline" width={16} />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    </>
  );
}

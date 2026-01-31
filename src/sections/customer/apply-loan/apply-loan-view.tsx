import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function ApplyLoanView() {
  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Apply for Loan
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              Loan application form will be implemented here.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </DashboardContent>
  );
}

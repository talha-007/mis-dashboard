import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function CustomerCreditRatingView() {
  const score = 72;
  const maxScore = 100;
  const risk = 'Moderate';

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Credit Rating
        </Typography>

        <Card sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
              Score
            </Typography>
            <Typography variant="h4">
              {score} / {maxScore}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
              Risk
            </Typography>
            <Typography variant="h4">{risk}</Typography>
          </Box>
        </Card>
      </Container>
    </DashboardContent>
  );
}

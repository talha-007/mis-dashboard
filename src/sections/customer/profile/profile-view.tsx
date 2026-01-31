import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function ProfileView() {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'customer@mis.local',
    phone: '+92 300 1234567',
    cnic: '12345-6789012-3',
    address: 'Lahore, Punjab',
    monthlyIncome: '50000',
    monthlyExpense: '30000',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission
    console.log('Profile updated:', formData);
    // Show success message or handle API call here
  };

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Typography variant="h4">Update Profile</Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Personal Information Section */}
              <Card>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Personal Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="CNIC"
                        name="cnic"
                        value={formData.cnic}
                        onChange={handleChange}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Card>

              {/* Financial Information Section */}
              <Card>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Financial Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Monthly Income"
                        name="monthlyIncome"
                        type="number"
                        value={formData.monthlyIncome}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                PKR
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Monthly Expense"
                        name="monthlyExpense"
                        type="number"
                        value={formData.monthlyExpense}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                PKR
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Card>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button type="button" variant="outlined" size="large">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" size="large">
                  Update Profile
                </Button>
              </Box>
            </Stack>
          </form>
        </Stack>
      </Container>
    </DashboardContent>
  );
}

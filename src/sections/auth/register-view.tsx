/**
 * Registration View
 * Two-column layout with image and form
 */

import type { RegisterData } from 'src/types/auth.types';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/hooks';

import { Iconify } from 'src/components/iconify';
import { GoogleLoginButton } from 'src/components/auth';

export function RegisterView() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setValidationError('');

      // Validation
      if (formData.password !== confirmPassword) {
        setValidationError('Passwords do not match');
        return;
      }

      if (formData.password.length < 8) {
        setValidationError('Password must be at least 8 characters');
        return;
      }

      try {
        await register(formData);
        // After successful registration, redirect to OTP verification
        router.push('/verify-otp?type=registration');
      } catch (err) {
        console.error('Registration failed:', err);
      }
    },
    [formData, confirmPassword, register, router]
  );

  const handleGoogleSuccess = useCallback(() => {
    router.push('/');
  }, [router]);

  const renderForm = (
    <Stack spacing={3} component="form" onSubmit={handleRegister}>
      {(error || validationError) && (
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          {validationError || error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          required
          name="firstName"
          label="First Name"
          placeholder="John"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          disabled={isLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
        <TextField
          fullWidth
          required
          name="lastName"
          label="Last Name"
          placeholder="Doe"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          disabled={isLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Stack>

      <TextField
        fullWidth
        required
        name="email"
        type="email"
        label="Email Address"
        placeholder="john.doe@example.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        disabled={isLoading}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon={"eva:email-outline" as any} width={20} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <TextField
        fullWidth
        name="phoneNumber"
        label="Phone Number"
        placeholder="+1 (555) 123-4567"
        value={formData.phoneNumber}
        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        disabled={isLoading}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon={"eva:phone-outline" as any} width={20} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <TextField
        fullWidth
        required
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        disabled={isLoading}
        helperText="Must be at least 8 characters"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon={"eva:lock-outline" as any} width={20} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <TextField
        fullWidth
        required
        name="confirmPassword"
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isLoading}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon={"eva:lock-outline" as any} width={20} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  size="small"
                >
                  <Iconify
                    icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        disabled={isLoading}
        sx={{
          mt: 1,
          py: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        }}
      >
        {isLoading ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} color="inherit" />
            <span>Creating Account...</span>
          </Stack>
        ) : (
          'Create Account'
        )}
      </Button>
    </Stack>
  );

  return (
    <Card
      sx={{
        
        maxWidth: 1200,
        height: '90vh',
        overflow: 'hidden',
        boxShadow: (theme) => theme.customShadows.card,
        borderRadius: 3,
        display: 'flex',
      }}
    >
      <Grid container sx={{ height: '100%', width: '100%' }}>
        {/* Left Column - Image & Text */}
        <Grid
          
          size={{xs: 12, md: 5}}
          sx={{
            position: 'relative',
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6,
            color: 'white',
            overflow: 'hidden',
          }}
        >
          {/* Background Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Content */}
          <Stack spacing={4} sx={{ zIndex: 1, maxWidth: 400 }}>
            {/* Icon/Illustration */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.common.white, 0.2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Iconify icon={"solar:shield-check-bold" as any} width={40} />
          </Box>

            {/* Title */}
            <Stack spacing={2}>
              <Typography variant="h3" fontWeight={700}>
                Start Your Financial Journey
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
                Join thousands of satisfied customers who trust us with their financial needs.
              </Typography>
            </Stack>

            {/* Features */}
            <Stack spacing={2.5}>
            {[
              {
                icon: 'solar:verified-check-bold' as any,
                title: 'Secure & Trusted',
                desc: 'Bank-level security for your data',
              },
              {
                icon: 'solar:wallet-money-bold' as any,
                title: 'Easy Management',
                desc: 'Manage your finances with ease',
              },
              {
                icon: 'solar:graph-up-bold' as any,
                title: 'Grow Your Wealth',
                desc: 'Access to best financial products',
              },
            ].map((feature, index) => (
              <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.common.white, 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon={feature.icon as any} width={20} />
                </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {feature.desc}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Grid>

        {/* Right Column - Form */}
        <Grid
          
          size={{xs:12, md:7}}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'auto',
            // Custom Scrollbar Styling
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: (theme) => theme.palette.divider,
              borderRadius: '10px',
              '&:hover': {
                backgroundColor: (theme) => theme.palette.action.hover,
              },
            },
            // Firefox
            scrollbarWidth: 'thin',
            scrollbarColor: (theme) => `${theme.palette.divider} transparent`,
          }}
        >
          <Box sx={{ p: { xs: 3, sm: 5, md: 6 }, flex: 1 }}>
            <Stack spacing={4}>
              {/* Header */}
              <Stack spacing={1.5}>
                <Typography variant="h4" fontWeight={700}>
                  Create Your Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join us today and start managing your finances
                </Typography>
              </Stack>

              {/* Google Sign Up */}
              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                disabled={isLoading}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              />

              {/* Divider */}
              <Divider sx={{ '&::before, &::after': { borderTopStyle: 'dashed' } }}>
                <Typography variant="body2" sx={{ color: 'text.disabled', px: 2 }}>
                  or continue with email
                </Typography>
              </Divider>

              {/* Registration Form */}
              {renderForm}

              {/* Footer */}
              <Stack spacing={2}>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  By creating an account, you agree to our{' '}
                  <Link
                    variant="caption"
                    color="primary"
                    underline="hover"
                    sx={{ cursor: 'pointer', fontWeight: 500 }}
                  >
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link
                    variant="caption"
                    color="primary"
                    underline="hover"
                    sx={{ cursor: 'pointer', fontWeight: 500 }}
                  >
                    Privacy Policy
                  </Link>
                </Typography>

                <Divider />

                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary" display="inline">
                    Already have an account?{' '}
                  </Typography>
                  <Link
                    variant="body2"
                    fontWeight={600}
                    onClick={() => router.push('/sign-in')}
                    sx={{ cursor: 'pointer' }}
                  >
                    Sign In
                  </Link>
                </Box>
              </Stack>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { getUserHomePath } from 'src/utils/role-home-path';

import { useAuth } from 'src/hooks';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const FEATURES = [
  {
    icon: 'solar:chart-2-bold-duotone',
    title: 'Portfolio Analytics',
    desc: 'Real-time KPIs, PAR tracking and disbursement trends',
  },
  {
    icon: 'solar:users-group-rounded-bold-duotone',
    title: 'Borrower Management',
    desc: 'Full borrower lifecycle — KYC, scoring, and repayments',
  },
  {
    icon: 'solar:shield-check-bold-duotone',
    title: 'Credit Risk Engine',
    desc: 'Automated grading, eligibility checks and risk reports',
  },
  {
    icon: 'solar:graph-up-bold-duotone',
    title: 'Recovery Tracking',
    desc: 'Overdue management, officer assignment and case notes',
  },
];

// ----------------------------------------------------------------------

export function SignInView() {
  const theme = useTheme();
  const router = useRouter();
  const { isLoading, error, login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const result = await login({
          email: formData.email,
          password: formData.password,
          rememberMe: true,
        });
        const targetUser = (result as any)?.user ?? null;
        if (targetUser) {
          router.push(getUserHomePath(targetUser));
        }
      } catch {
        // error handled by Redux
      }
    },
    [formData.email, formData.password, login, router]
  );

  return (
    <Card
      sx={{
        display: 'flex',
        overflow: 'hidden',
        width: '100%',
        maxWidth: 980,
        minHeight: { xs: 'auto', md: 600 },
        borderRadius: 3,
        boxShadow: theme.customShadows?.z24 || '0 24px 48px rgba(0,0,0,0.18)',
      }}
    >
      {/* ── Left: Brand panel ────────────────────────────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '44%',
          flexShrink: 0,
          p: 5,
          background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, ${alpha(theme.palette.primary.light, 0.9)} 100%)`,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -80,
            right: -80,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: alpha('#fff', 0.06),
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: alpha('#fff', 0.05),
          },
        }}
      >
        {/* Logo on brand panel */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Logo
            sx={{
              filter: 'brightness(0) invert(1)',
              height: 36,
              '& img': { height: 36 },
            }}
          />
        </Box>

        {/* Headline */}
        <Box sx={{ position: 'relative', zIndex: 1, my: 'auto', py: 4 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            lineHeight={1.2}
            sx={{ mb: 1.5, letterSpacing: '-0.5px' }}
          >
            Manage your
            <br />
            portfolio smarter.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.75, mb: 4, maxWidth: 280 }}>
            Complete MIS platform built for modern microfinance institutions.
          </Typography>

          {/* Feature list */}
          <Stack spacing={2.5}>
            {FEATURES.map((f) => (
              <Stack key={f.title} direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha('#fff', 0.15),
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  <Iconify icon={f.icon} width={18} sx={{ color: '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff' }}>
                    {f.title}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.65, color: '#fff' }}>
                    {f.desc}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Footer note */}
        <Typography variant="caption" sx={{ opacity: 0.4, position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} MIS Dashboard. All rights reserved.
        </Typography>
      </Box>

      {/* ── Right: Form panel ─────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 3, sm: 5, md: 6 },
          py: { xs: 5, md: 6 },
          bgcolor: 'background.paper',
        }}
      >
        {/* Mobile logo */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 4 }}>
          <Logo sx={{ height: 32, '& img': { height: 32 } }} />
        </Box>

        {/* Heading */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.75, letterSpacing: '-0.3px' }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your MIS account to continue
          </Typography>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Stack spacing={2.5} component="form" onSubmit={handleSignIn}>
          <TextField
            fullWidth
            required
            name="email"
            type="email"
            label="Email address"
            placeholder="you@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={isLoading}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify
                      icon="solar:inbox-bold-duotone"
                      width={20}
                      sx={{ color: 'text.disabled' }}
                    />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify
                      icon="solar:lock-password-bold-duotone"
                      width={20}
                      sx={{ color: 'text.disabled' }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
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
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
            <Link
              variant="body2"
              fontWeight={600}
              onClick={() => router.push('/forgot-password')}
              sx={{ cursor: 'pointer', color: 'primary.main' }}
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontSize: '0.95rem',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.32)}`,
              '&:hover': {
                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            {isLoading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} color="inherit" />
                <span>Signing in…</span>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center">
                <span>Sign in</span>
                <Iconify icon="solar:arrow-right-bold" width={18} />
              </Stack>
            )}
          </Button>
        </Stack>
      </Box>
    </Card>
  );
}

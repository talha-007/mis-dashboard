import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import bankAdminService from 'src/redux/services/bank-admin.services';

import { Iconify } from 'src/components/iconify';

export type BankSettings = {
  insuranceRate: number;
  interestRate: number;
};

const defaultSettings: BankSettings = {
  insuranceRate: 0,
  interestRate: 0,
};

export function BankSettingsView() {
  const [settings, setSettings] = useState<BankSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bankAdminService.getBankSettings();
      setSettings({
        insuranceRate: data?.insuranceRate ?? defaultSettings.insuranceRate,
        interestRate: data?.interestRate ?? defaultSettings.interestRate,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load settings');
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [successMessage]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await bankAdminService.updateBankSettings(settings);
      setSuccessMessage('Settings saved successfully.');
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.response?.data?.msg ??
        err?.message;
      setError(serverMessage || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof BankSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        <Stack spacing={3}>
          <Typography variant="h4">Bank Settings</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure insurance and interest rates for your bank. These rates will be applied to
            loan calculations.
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Loan Rates
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Insurance Rate"
                type="number"
                value={settings.insuranceRate}
                onChange={handleChange('insuranceRate')}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                helperText="Percentage applied to loan amount for insurance."
              />
              <TextField
                fullWidth
                label="Interest Rate"
                type="number"
                value={settings.interestRate}
                onChange={handleChange('interestRate')}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                helperText="Annual interest rate applied to loans."
              />
            </Stack>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => fetchSettings()}>
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={
                saving ? <CircularProgress size={18} /> : <Iconify icon="solar:diskette-bold" />
              }
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </DashboardContent>
  );
}

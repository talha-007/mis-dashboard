import type { SystemSettings, BankAccessSettings } from 'src/_mock/_bank-settings';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

const defaultSystemSettings: SystemSettings = {
  masterAccessControl: { enableAllBanks: false, maintenanceMode: false },
  globalSecurity: {
    requireTwoFactorAuth: false,
    defaultSessionTimeout: 30,
    enforcePasswordPolicy: true,
  },
  notifications: { emailAlerts: false, smsAlerts: false, systemMaintenanceAlerts: false },
};

// ----------------------------------------------------------------------

export function SettingsView() {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSystemSettings);
  const [bankSettings, setBankSettings] = useState<BankAccessSettings[]>([]);
  const [expandedBank, setExpandedBank] = useState<string | false>(false);

  const handleSystemSettingChange = (
    section: keyof SystemSettings,
    field: string,
    value: boolean | number
  ) => {
    setSystemSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleBankSettingChange = (
    bankId: string,
    section: string,
    field: string,
    value: boolean | string | string[] | number
  ) => {
    setBankSettings((prev) =>
      prev.map((bank) => {
        if (bank.bankId === bankId) {
          if (section === 'main') {
            return { ...bank, [field]: value };
          }
          const sectionData = bank[section as keyof BankAccessSettings] as Record<string, unknown>;
          return {
            ...bank,
            [section]: {
              ...sectionData,
              [field]: value,
            },
          };
        }
        return bank;
      })
    );
  };

  const handleAddIP = (bankId: string, ip: string) => {
    if (ip && !bankSettings.find((b) => b.bankId === bankId)?.ipWhitelist.includes(ip)) {
      handleBankSettingChange(bankId, 'main', 'ipWhitelist', [
        ...(bankSettings.find((b) => b.bankId === bankId)?.ipWhitelist || []),
        ip,
      ]);
    }
  };

  const handleRemoveIP = (bankId: string, ip: string) => {
    const bank = bankSettings.find((b) => b.bankId === bankId);
    if (bank) {
      handleBankSettingChange(
        bankId,
        'main',
        'ipWhitelist',
        bank.ipWhitelist.filter((i) => i !== ip)
      );
    }
  };

  const handleSave = () => {
    // Save settings to backend
    console.log('Saving settings:', { systemSettings, bankSettings });
    // Show success message
  };

  const handleExpandBank =
    (bankId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedBank(isExpanded ? bankId : false);
    };

  return (
    <DashboardContent>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Stack spacing={3}>
          <Typography variant="h4">System Settings</Typography>

          {/* Master Access Control */}
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Master Access Control
              </Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.masterAccessControl.enableAllBanks}
                      onChange={(e) =>
                        handleSystemSettingChange(
                          'masterAccessControl',
                          'enableAllBanks',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Enable All Banks Dashboard Access"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.masterAccessControl.maintenanceMode}
                      onChange={(e) =>
                        handleSystemSettingChange(
                          'masterAccessControl',
                          'maintenanceMode',
                          e.target.checked
                        )
                      }
                      color="warning"
                    />
                  }
                  label="Maintenance Mode (Disable All Bank Access)"
                />
                {systemSettings.masterAccessControl.maintenanceMode && (
                  <Typography variant="caption" color="warning.main">
                    All banks will be unable to access the dashboard during maintenance mode.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Card>

          {/* Global Security Settings */}
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Global Security Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemSettings.globalSecurity.requireTwoFactorAuth}
                        onChange={(e) =>
                          handleSystemSettingChange(
                            'globalSecurity',
                            'requireTwoFactorAuth',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Require Two-Factor Authentication"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Default Session Timeout (minutes)"
                    type="number"
                    value={systemSettings.globalSecurity.defaultSessionTimeout}
                    onChange={(e) =>
                      handleSystemSettingChange(
                        'globalSecurity',
                        'defaultSessionTimeout',
                        parseInt(e.target.value, 10) || 30
                      )
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemSettings.globalSecurity.enforcePasswordPolicy}
                        onChange={(e) =>
                          handleSystemSettingChange(
                            'globalSecurity',
                            'enforcePasswordPolicy',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Enforce Password Policy"
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>

          {/* Notification Settings */}
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Notification Settings
              </Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.notifications.emailAlerts}
                      onChange={(e) =>
                        handleSystemSettingChange('notifications', 'emailAlerts', e.target.checked)
                      }
                    />
                  }
                  label="Email Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.notifications.smsAlerts}
                      onChange={(e) =>
                        handleSystemSettingChange('notifications', 'smsAlerts', e.target.checked)
                      }
                    />
                  }
                  label="SMS Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.notifications.systemMaintenanceAlerts}
                      onChange={(e) =>
                        handleSystemSettingChange(
                          'notifications',
                          'systemMaintenanceAlerts',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="System Maintenance Alerts"
                />
              </Stack>
            </Box>
          </Card>

          <Divider />

          {/* Bank-Specific Access Control */}
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Bank Access Control
            </Typography>
            <Stack spacing={2}>
              {bankSettings.map((bank) => (
                <Accordion
                  key={bank.bankId}
                  expanded={expandedBank === bank.bankId}
                  onChange={handleExpandBank(bank.bankId)}
                >
                  <AccordionSummary expandIcon={<Iconify icon="eva:chevron-down-fill" />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Typography variant="subtitle1" sx={{ flex: 1 }}>
                        {bank.bankName} ({bank.bankCode})
                      </Typography>
                      <Chip
                        label={bank.dashboardAccess ? 'Access Enabled' : 'Access Disabled'}
                        color={bank.dashboardAccess ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Scrollbar>
                      <Stack spacing={3}>
                        {/* Dashboard Access Toggle */}
                        <Box>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={bank.dashboardAccess}
                                onChange={(e) =>
                                  handleBankSettingChange(
                                    bank.bankId,
                                    'main',
                                    'dashboardAccess',
                                    e.target.checked
                                  )
                                }
                              />
                            }
                            label="Enable Dashboard Access"
                          />
                        </Box>

                        <Divider />

                        {/* IP Whitelisting */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 2 }}>
                            IP Whitelist
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <TextField
                              size="small"
                              placeholder="192.168.1.100"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.target as HTMLInputElement;
                                  handleAddIP(bank.bankId, input.value);
                                  input.value = '';
                                }
                              }}
                            />
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                const input = e.currentTarget
                                  .previousElementSibling as HTMLInputElement;
                                if (input) {
                                  handleAddIP(bank.bankId, input.value);
                                  input.value = '';
                                }
                              }}
                            >
                              Add IP
                            </Button>
                          </Stack>
                          {bank.ipWhitelist.length > 0 ? (
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                              {bank.ipWhitelist.map((ip) => (
                                <Chip
                                  key={ip}
                                  label={ip}
                                  onDelete={() => handleRemoveIP(bank.bankId, ip)}
                                  size="small"
                                />
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No IP restrictions. All IPs allowed.
                            </Typography>
                          )}
                        </Box>

                        <Divider />

                        {/* Access Hours */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 2 }}>
                            Access Hours Restriction
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={bank.accessHours.enabled}
                                onChange={(e) =>
                                  handleBankSettingChange(
                                    bank.bankId,
                                    'accessHours',
                                    'enabled',
                                    e.target.checked
                                  )
                                }
                              />
                            }
                            label="Enable Access Hours Restriction"
                          />
                          {bank.accessHours.enabled && (
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  fullWidth
                                  label="Start Time"
                                  type="time"
                                  value={bank.accessHours.startTime}
                                  onChange={(e) =>
                                    handleBankSettingChange(
                                      bank.bankId,
                                      'accessHours',
                                      'startTime',
                                      e.target.value
                                    )
                                  }
                                  InputLabelProps={{ shrink: true }}
                                />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  fullWidth
                                  label="End Time"
                                  type="time"
                                  value={bank.accessHours.endTime}
                                  onChange={(e) =>
                                    handleBankSettingChange(
                                      bank.bankId,
                                      'accessHours',
                                      'endTime',
                                      e.target.value
                                    )
                                  }
                                  InputLabelProps={{ shrink: true }}
                                />
                              </Grid>
                            </Grid>
                          )}
                        </Box>

                        <Divider />

                        {/* Feature Permissions */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 2 }}>
                            Feature Permissions
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={bank.featurePermissions.borrowerManagement}
                                    onChange={(e) =>
                                      handleBankSettingChange(
                                        bank.bankId,
                                        'featurePermissions',
                                        'borrowerManagement',
                                        e.target.checked
                                      )
                                    }
                                    disabled={!bank.dashboardAccess}
                                  />
                                }
                                label="Borrower Management"
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={bank.featurePermissions.loanApplications}
                                    onChange={(e) =>
                                      handleBankSettingChange(
                                        bank.bankId,
                                        'featurePermissions',
                                        'loanApplications',
                                        e.target.checked
                                      )
                                    }
                                    disabled={!bank.dashboardAccess}
                                  />
                                }
                                label="Loan Applications"
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={bank.featurePermissions.paymentsLedger}
                                    onChange={(e) =>
                                      handleBankSettingChange(
                                        bank.bankId,
                                        'featurePermissions',
                                        'paymentsLedger',
                                        e.target.checked
                                      )
                                    }
                                    disabled={!bank.dashboardAccess}
                                  />
                                }
                                label="Payments & Ledger"
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={bank.featurePermissions.creditRatings}
                                    onChange={(e) =>
                                      handleBankSettingChange(
                                        bank.bankId,
                                        'featurePermissions',
                                        'creditRatings',
                                        e.target.checked
                                      )
                                    }
                                    disabled={!bank.dashboardAccess}
                                  />
                                }
                                label="Credit Ratings"
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={bank.featurePermissions.reports}
                                    onChange={(e) =>
                                      handleBankSettingChange(
                                        bank.bankId,
                                        'featurePermissions',
                                        'reports',
                                        e.target.checked
                                      )
                                    }
                                    disabled={!bank.dashboardAccess}
                                  />
                                }
                                label="MIS & Reports"
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={bank.featurePermissions.recoveryManagement}
                                    onChange={(e) =>
                                      handleBankSettingChange(
                                        bank.bankId,
                                        'featurePermissions',
                                        'recoveryManagement',
                                        e.target.checked
                                      )
                                    }
                                    disabled={!bank.dashboardAccess}
                                  />
                                }
                                label="Recovery Management"
                              />
                            </Grid>
                          </Grid>
                        </Box>

                        <Divider />

                        {/* Security Settings */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 2 }}>
                            Security Settings
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={bank.securitySettings.twoFactorAuth}
                                    onChange={(e) =>
                                      handleBankSettingChange(
                                        bank.bankId,
                                        'securitySettings',
                                        'twoFactorAuth',
                                        e.target.checked
                                      )
                                    }
                                    disabled={!bank.dashboardAccess}
                                  />
                                }
                                label="Two-Factor Authentication"
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                label="Session Timeout (minutes)"
                                type="number"
                                value={bank.securitySettings.sessionTimeout}
                                onChange={(e) =>
                                  handleBankSettingChange(
                                    bank.bankId,
                                    'securitySettings',
                                    'sessionTimeout',
                                    parseInt(e.target.value, 10) || 30
                                  )
                                }
                                disabled={!bank.dashboardAccess}
                              />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={bank.securitySettings.passwordPolicy}
                                    onChange={(e) =>
                                      handleBankSettingChange(
                                        bank.bankId,
                                        'securitySettings',
                                        'passwordPolicy',
                                        e.target.checked
                                      )
                                    }
                                    disabled={!bank.dashboardAccess}
                                  />
                                }
                                label="Enforce Password Policy"
                              />
                            </Grid>
                          </Grid>
                        </Box>

                        <Divider />

                        {/* Data Visibility */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 2 }}>
                            Data Visibility
                          </Typography>
                          <Stack spacing={2}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={bank.dataVisibility.viewOwnDataOnly}
                                  onChange={(e) =>
                                    handleBankSettingChange(
                                      bank.bankId,
                                      'dataVisibility',
                                      'viewOwnDataOnly',
                                      e.target.checked
                                    )
                                  }
                                  disabled={!bank.dashboardAccess}
                                />
                              }
                              label="View Own Data Only"
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={bank.dataVisibility.allowDataExport}
                                  onChange={(e) =>
                                    handleBankSettingChange(
                                      bank.bankId,
                                      'dataVisibility',
                                      'allowDataExport',
                                      e.target.checked
                                    )
                                  }
                                  disabled={!bank.dashboardAccess}
                                />
                              }
                              label="Allow Data Export"
                            />
                          </Stack>
                        </Box>
                      </Stack>
                    </Scrollbar>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Box>

          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => window.location.reload()}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              startIcon={<Iconify icon="eva:save-fill" />}
            >
              Save Settings
            </Button>
          </Box>
        </Stack>
      </Box>
    </DashboardContent>
  );
}

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import bankAdminService from 'src/redux/services/bank-admin.services';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Employee = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive?: boolean;
  openCases?: number;
};

// ----------------------------------------------------------------------

export function EmployeeView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('all');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bankAdminService.getEmployees();
      const raw = res.data?.data ?? res.data;
      const list = raw?.employees ?? raw ?? [];
      const mapped: Employee[] = Array.isArray(list)
        ? list.map((e: any) => ({
            _id: String(e._id ?? e.id),
            name: e.name ?? '',
            email: e.email ?? '',
            phone: e.phone ?? '',
            isActive: e.isActive ?? e.active ?? true,
            openCases: e.openCases ?? e.openCaseCount ?? 0,
          }))
        : [];
      setEmployees(mapped);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleOpenDialog = () => {
    setForm({ name: '', email: '', phone: '', password: '' });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password.trim()) {
      setFormError('All fields are required');
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      await bankAdminService.createEmployee({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      setDialogOpen(false);
      await fetchEmployees();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to create employee');
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter((e) => {
    if (filterTab === 'active') return e.isActive !== false;
    if (filterTab === 'inactive') return e.isActive === false;
    return true;
  });

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Employees
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenDialog}
        >
          Add employee
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={filterTab}
            onChange={(_e, v) => setFilterTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All" value="all" />
            <Tab label="Active" value="active" />
            <Tab label="Inactive" value="inactive" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="right">Open cases</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.length ? (
                  filteredEmployees.map((emp) => (
                    <TableRow key={emp._id} hover>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.phone}</TableCell>
                      <TableCell align="right">{emp.openCases ?? 0}</TableCell>
                      <TableCell>
                        {emp.isActive !== false ? (
                          <Typography variant="caption" color="success.main">
                            Active
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Inactive
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No employees found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add employee</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {formError && (
              <Alert severity="error" onClose={() => setFormError(null)}>
                {formError}
              </Alert>
            )}
            <TextField
              label="Name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <TextField
              label="Phone"
              fullWidth
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} /> : undefined}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

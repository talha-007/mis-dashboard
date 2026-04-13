import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { toast } from 'react-toastify';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { DashboardContent } from 'src/layouts/dashboard';
import bankAdminService from 'src/redux/services/bank-admin.services';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/** Mobile: 10–15 digits; allows +, spaces, dashes, parentheses */
const PHONE_REGEX = /^[+]?[\d\s\-()]{10,20}$/;

function phoneTest(value: string | undefined) {
  if (!value?.trim()) return false;
  const trimmed = value.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) return false;
  return PHONE_REGEX.test(trimmed);
}

/** Pakistani CNIC: 13 digits, display XXXXX-XXXXXXX-X */
const CNIC_DIGITS_REGEX = /^\d{13}$/;
const CNIC_FORMAT_REGEX = /^\d{5}-\d{7}-\d{1}$/;

function cnicTest(value: string | undefined) {
  if (!value?.trim()) return false;
  const digits = value.replace(/\D/g, '');
  if (!CNIC_DIGITS_REGEX.test(digits)) return false;
  const trimmed = value.trim();
  if (trimmed.includes('-')) return CNIC_FORMAT_REGEX.test(trimmed);
  return true;
}

/** Auto-format CNIC as user types (same as customer / users forms) */
function sanitizeCnicInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

const JOB_ROLE_OPTIONS = [
  { value: 'recovery_officer', label: 'Recovery officer' },
  // { value: 'support_staff', label: 'Support staff' },
  // { value: 'loan_officer', label: 'Loan officer' },
];

export type EmployeeFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  cnic: string;
  city: string;
  region: string;
  department: string;
  designation: string;
  jobRole: string;
  employeeCode: string;
  notes: string;
};

const emptyValues: EmployeeFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  cnic: '',
  city: '',
  region: '',
  department: '',
  designation: '',
  jobRole: 'recovery_officer',
  employeeCode: '',
  notes: '',
};

const baseFields = {
  firstName: Yup.string().required('First name is required').trim(),
  lastName: Yup.string().required('Last name is required').trim(),
  email: Yup.string().required('Email is required').email('Enter a valid email').trim(),
  phone: Yup.string()
    .required('Phone number is required')
    .test(
      'phone',
      'Enter a valid mobile number (10–15 digits, optional + and spaces)',
      (v) => phoneTest(v)
    ),
  cnic: Yup.string()
    .required('CNIC is required')
    .test(
      'cnic',
      'CNIC must be 13 digits in format 12345-1234567-1',
      (v) => cnicTest(v)
    ),
  city: Yup.string().trim(),
  region: Yup.string().trim(),
  department: Yup.string().trim(),
  designation: Yup.string().trim(),
  jobRole: Yup.string().required(),
  employeeCode: Yup.string().trim(),
  notes: Yup.string().trim(),
};

function buildSchema(isEdit: boolean) {
  if (isEdit) {
    return Yup.object({
      ...baseFields,
      password: Yup.string().test(
        'min',
        'At least 8 characters',
        (v) => !v || !String(v).trim() || String(v).length >= 8
      ),
      confirmPassword: Yup.string().test('match', 'Passwords must match', function (v) {
        const pwd = this.parent.password;
        if (!pwd || !String(pwd).trim()) return true;
        return v === pwd;
      }),
    });
  }
  return Yup.object({
    ...baseFields,
    password: Yup.string().required('Password is required').min(8, 'At least 8 characters'),
    confirmPassword: Yup.string()
      .required('Confirm password')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
  });
}

function splitFullName(name: string) {
  const parts = (name || '').trim().split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
}

/** Backend may return `email` on the employee object or on the parent payload next to `employee`. */
function pickWorkEmail(
  entity: Record<string, unknown>,
  parent?: Record<string, unknown> | null
): string {
  const s = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

  const fromUser = (o: Record<string, unknown>) => {
    const u = o.user;
    if (u && typeof u === 'object' && u !== null) {
      return s((u as { email?: string }).email);
    }
    return '';
  };

  return (
    s(entity.email) ||
    s(entity.workEmail) ||
    fromUser(entity) ||
    (parent ? s(parent.email) || s(parent.workEmail) || fromUser(parent) : '') ||
    ''
  );
}

export function EmployeeFormView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [initialValues, setInitialValues] = useState<EmployeeFormValues>(emptyValues);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) {
      return undefined;
    }
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await bankAdminService.getEmployeeById(id);
        const raw = res.data?.data ?? res.data;
        const e = raw?.employee ?? raw;
        if (cancelled || !e) return;
        const rawObj =
          raw && typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : null;
        const { firstName, lastName } = e.firstName
          ? { firstName: e.firstName, lastName: e.lastName ?? '' }
          : splitFullName(e.name ?? '');
        const rawRole = e.jobRole ?? e.role;
        const jobRole =
          typeof rawRole === 'string'
            ? rawRole.toLowerCase().replace(/-/g, '_')
            : 'recovery_officer';
        const allowedRoles = JOB_ROLE_OPTIONS.map((o) => o.value);
        const safeJobRole = allowedRoles.includes(jobRole) ? jobRole : 'recovery_officer';

        setInitialValues({
          firstName,
          lastName,
          email: pickWorkEmail(e as Record<string, unknown>, rawObj),
          phone: e.phone ?? '',
          password: '',
          confirmPassword: '',
          cnic: e.cnic ? sanitizeCnicInput(String(e.cnic)) : '',
          city: e.city ?? '',
          region: e.region ?? '',
          department: e.department ?? '',
          designation: e.designation ?? '',
          jobRole: safeJobRole,
          employeeCode: e.employeeCode ?? e.code ?? '',
          notes: e.notes ?? '',
        });
      } catch (err: any) {
        toast.error(err?.response?.data?.message || err?.message || 'Failed to load employee');
        navigate('/employees');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, navigate]);

  const buildPayload = useCallback(
    (values: EmployeeFormValues) => {
      const name = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
      const cnicDigits = values.cnic.replace(/\D/g, '');
      const cnicFormatted =
        cnicDigits.length === 13
          ? `${cnicDigits.slice(0, 5)}-${cnicDigits.slice(5, 12)}-${cnicDigits.slice(12, 13)}`
          : values.cnic.trim() || undefined;

      const base: Record<string, unknown> = {
        name,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        cnic: cnicFormatted,
        city: values.city.trim() || undefined,
        region: values.region.trim() || undefined,
        department: values.department.trim() || undefined,
        designation: values.designation.trim() || undefined,
        jobRole: values.jobRole,
        employeeCode: values.employeeCode.trim() || undefined,
        notes: values.notes.trim() || undefined,
      };
      if (values.password.trim()) {
        base.password = values.password.trim();
      }
      return base;
    },
    []
  );

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
          <Typography color="text.secondary">Loading…</Typography>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Typography variant="h4">{isEdit ? 'Edit employee' : 'Add employee'}</Typography>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate('/employees')}
          >
            Back to list
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Enter the employee&apos;s details. Recovery and loan staff can be assigned cases from recovery
          workflows.
        </Typography>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={buildSchema(isEdit)}
          onSubmit={async (values, { setStatus }) => {
            setStatus(undefined);
            try {
              const payload = buildPayload(values);
              if (isEdit && id) {
                await bankAdminService.updateEmployee(id, payload);
                toast.success('Employee updated successfully');
              } else {
                await bankAdminService.createEmployee(payload);
                toast.success('Employee added successfully');
              }
              navigate('/employees');
            } catch (err: any) {
              setStatus({
                submitError:
                  err?.response?.data?.message || err?.message || 'Could not save employee',
              });
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit: formikSubmit,
            isSubmitting,
            status,
            setStatus,
            setFieldValue,
          }) => (
            <Form onSubmit={formikSubmit}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {status?.submitError && (
                    <Alert severity="error" onClose={() => setStatus(undefined)}>
                      {status.submitError}
                    </Alert>
                  )}

                  <Typography variant="subtitle1" fontWeight={600}>
                    Personal
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      name="firstName"
                      label="First name"
                      value={values.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                    />
                    <TextField
                      fullWidth
                      name="lastName"
                      label="Last name"
                      value={values.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.lastName && Boolean(errors.lastName)}
                      helperText={touched.lastName && errors.lastName}
                    />
                  </Stack>
                  <TextField
                    fullWidth
                    name="cnic"
                    label="CNIC / National ID"
                    value={values.cnic}
                    onChange={(e) => setFieldValue('cnic', sanitizeCnicInput(e.target.value))}
                    onBlur={handleBlur}
                    error={touched.cnic && Boolean(errors.cnic)}
                    helperText={
                      touched.cnic && errors.cnic
                        ? errors.cnic
                        : '13 digits: 12345-1234567-1 (formatted as you type)'
                    }
                    placeholder="12345-1234567-1"
                    inputProps={{ maxLength: 15 }}
                  />

                  <Divider />

                  <Typography variant="subtitle1" fontWeight={600}>
                    Contact
                  </Typography>
                  <TextField
                    fullWidth
                    name="email"
                    label="Work email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isEdit}
                    error={touched.email && Boolean(errors.email)}
                    helperText={
                      (touched.email && errors.email) || (isEdit ? 'Email cannot be changed' : '')
                    }
                  />
                  <TextField
                    fullWidth
                    name="phone"
                    label="Mobile phone"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={
                      touched.phone && errors.phone
                        ? errors.phone
                        : '10–15 digits; spaces, dashes, or + allowed (e.g. 03001234567, +92 300 1234567)'
                    }
                    placeholder="03001234567"
                    inputProps={{ inputMode: 'tel', autoComplete: 'tel' }}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      name="city"
                      label="City"
                      value={values.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <TextField
                      fullWidth
                      name="region"
                      label="Region / Province"
                      value={values.region}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Stack>

                  <Divider />

                  <Typography variant="subtitle1" fontWeight={600}>
                    Role & organization
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    name="jobRole"
                    label="Job role"
                    value={values.jobRole}
                    onChange={handleChange}
                  >
                    {JOB_ROLE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      name="department"
                      label="Department"
                      value={values.department}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Collections"
                    />
                    <TextField
                      fullWidth
                      name="designation"
                      label="Designation"
                      value={values.designation}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Senior officer"
                    />
                  </Stack>
                  <TextField
                    fullWidth
                    name="employeeCode"
                    label="Employee code (optional)"
                    value={values.employeeCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Internal reference ID"
                  />

                  <Divider />

                  <Typography variant="subtitle1" fontWeight={600}>
                    Account access
                  </Typography>
                  {!isEdit && (
                    <>
                      <TextField
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="Toggle password visibility"
                                  onClick={() => setShowPassword((v) => !v)}
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
                      />
                      <TextField
                        fullWidth
                        name="confirmPassword"
                        label="Confirm password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="Toggle confirm password visibility"
                                  onClick={() => setShowConfirmPassword((v) => !v)}
                                  edge="end"
                                  size="small"
                                >
                                  <Iconify
                                    icon={
                                      showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'
                                    }
                                    width={20}
                                  />
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </>
                  )}
                  {isEdit && (
                    <>
                      <TextField
                        fullWidth
                        name="password"
                        label="New password (optional)"
                        type={showPassword ? 'text' : 'password'}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.password && Boolean(errors.password)}
                        helperText={
                          touched.password && errors.password
                            ? errors.password
                            : 'Leave blank to keep the current password'
                        }
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="Toggle password visibility"
                                  onClick={() => setShowPassword((v) => !v)}
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
                      />
                      <TextField
                        fullWidth
                        name="confirmPassword"
                        label="Confirm new password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="Toggle confirm password visibility"
                                  onClick={() => setShowConfirmPassword((v) => !v)}
                                  edge="end"
                                  size="small"
                                >
                                  <Iconify
                                    icon={
                                      showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'
                                    }
                                    width={20}
                                  />
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </>
                  )}

                  <TextField
                    fullWidth
                    name="notes"
                    label="Notes (optional)"
                    value={values.notes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    multiline
                    minRows={3}
                    placeholder="Internal notes about this employee"
                  />

                  <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ pt: 2 }}>
                    <Button variant="outlined" color="inherit" onClick={() => navigate('/employees')}>
                      Cancel
                    </Button>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      loading={isSubmitting}
                      startIcon={<Iconify icon="solar:diskette-bold" />}
                    >
                      {isEdit ? 'Save changes' : 'Create employee'}
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Card>
            </Form>
          )}
        </Formik>
      </Stack>
    </DashboardContent>
  );
}

import type {
  ReschedulePaymentPlanMode,
  ReschedulePaymentPlanPayload,
} from 'src/types/loan-application-reschedule.types';

import { toast } from 'react-toastify';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency } from 'src/utils/format-number';
import { estimateMonthlyInstallmentPreview } from 'src/utils/loan-installment';

import bankAdminService from 'src/redux/services/bank-admin.services';
import loanApplicationService from 'src/redux/services/loan-applications';

// ----------------------------------------------------------------------

const MODE_OPTIONS: { value: ReschedulePaymentPlanMode; label: string; helper: string }[] = [
  {
    value: 'auto',
    label: 'Auto',
    helper: 'Server chooses the best approach (default).',
  },
  {
    value: 'full',
    label: 'Full',
    helper: 'Rebuild the entire schedule (full tenor). Optional: recalculate from loan amount and bank rates.',
  },
  {
    value: 'unpaid_only',
    label: 'Unpaid only',
    helper: 'Reschedule remaining installments only.',
  },
];

function buildPayload(input: {
  mode: ReschedulePaymentPlanMode;
  durationMonths: string;
  installmentAmount: string;
  firstDueDate: string;
  recalculateFromRates: boolean;
}): ReschedulePaymentPlanPayload {
  const body: ReschedulePaymentPlanPayload = { mode: input.mode };

  const dm = input.durationMonths.trim();
  if (dm !== '') {
    const n = Number(dm);
    if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
      throw new Error('Duration (months) must be a positive whole number.');
    }
    body.durationMonths = n;
  }

  const amt = input.installmentAmount.trim();
  if (amt !== '') {
    const n = Number(amt);
    if (!Number.isFinite(n) || n <= 0) {
      throw new Error('Installment amount must be a positive number.');
    }
    body.installmentAmount = n;
  }

  const fd = input.firstDueDate.trim();
  if (fd !== '') {
    body.firstDueDate = fd;
  }

  if (input.mode === 'full' && input.recalculateFromRates) {
    body.recalculateFromRates = true;
  }

  return body;
}

// ----------------------------------------------------------------------

type LoanApplicationRescheduleDialogProps = {
  open: boolean;
  onClose: () => void;
  loanApplicationId: string;
  /** Loan principal — used for estimated installment preview when duration is entered. */
  loanPrincipal: number;
  /** Prefer rates from loan detail (projected plan); bank settings fill in if missing. */
  interestRatePercent?: number | null;
  insuranceRatePercent?: number | null;
  /** Called after a successful reschedule so the parent can refetch detail. */
  onSuccess: () => void | Promise<void>;
};

export function LoanApplicationRescheduleDialog({
  open,
  onClose,
  loanApplicationId,
  loanPrincipal,
  interestRatePercent: interestFromPlan,
  insuranceRatePercent: insuranceFromPlan,
  onSuccess,
}: LoanApplicationRescheduleDialogProps) {
  const [mode, setMode] = useState<ReschedulePaymentPlanMode>('auto');
  const [durationMonths, setDurationMonths] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [firstDueDate, setFirstDueDate] = useState('');
  const [recalculateFromRates, setRecalculateFromRates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  /** Fallback when projected plan does not include rates */
  const [bankRates, setBankRates] = useState<{ interest: number; insurance: number } | null>(null);

  const effectiveInterest =
    interestFromPlan !== null && interestFromPlan !== undefined
      ? interestFromPlan
      : bankRates?.interest ?? null;
  const effectiveInsurance =
    insuranceFromPlan !== null && insuranceFromPlan !== undefined
      ? insuranceFromPlan
      : bankRates?.insurance ?? null;

  const estimatedInstallment = useMemo(() => {
    const raw = durationMonths.trim();
    if (raw === '') return null;
    const months = Number.parseInt(raw, 10);
    if (!Number.isFinite(months) || months < 1) return null;
    return estimateMonthlyInstallmentPreview({
      principal: loanPrincipal,
      months,
      annualInterestPercent: effectiveInterest,
      annualInsurancePercent: effectiveInsurance,
    });
  }, [durationMonths, loanPrincipal, effectiveInterest, effectiveInsurance]);

  const resetForm = useCallback(() => {
    setMode('auto');
    setDurationMonths('');
    setInstallmentAmount('');
    setFirstDueDate('');
    setRecalculateFromRates(false);
    setFormError(null);
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
      setBankRates(null);
    }
  }, [open, resetForm]);

  useEffect(() => {
    if (!open) {
      return () => {};
    }
    let cancelled = false;
    (async () => {
      try {
        const s = await bankAdminService.getBankSettings();
        if (!cancelled) {
          setBankRates({ interest: s.interestRate, insurance: s.insuranceRate });
        }
      } catch {
        if (!cancelled) setBankRates(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (mode !== 'full') {
      setRecalculateFromRates(false);
    }
  }, [mode]);

  const handleSubmit = async () => {
    setFormError(null);
    let payload: ReschedulePaymentPlanPayload;
    try {
      payload = buildPayload({
        mode,
        durationMonths,
        installmentAmount,
        firstDueDate,
        recalculateFromRates,
      });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Invalid input');
      return;
    }

    try {
      setSubmitting(true);
      const res = await loanApplicationService.reschedulePaymentPlan(loanApplicationId, {
        ...payload,
      });
      const msg =
        (res.data as { message?: string })?.message ||
        (res.data as { data?: { message?: string } })?.data?.message;
      toast.success(typeof msg === 'string' ? msg : 'Payment plan rescheduled.');
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      const fallback = err instanceof Error ? err.message : 'Reschedule failed';
      toast.error(message || fallback);
    } finally {
      setSubmitting(false);
    }
  };

  const modeMeta = MODE_OPTIONS.find((m) => m.value === mode);

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reschedule payment plan</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            This replaces the future payment schedule for this loan application. Changes are audited
            server-side. Use optional fields only when you need to override defaults.
          </Typography>

          <TextField
            select
            label="Mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as ReschedulePaymentPlanMode)}
            size="small"
            fullWidth
            helperText={modeMeta?.helper}
          >
            {MODE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Duration (months)"
            size="small"
            fullWidth
            type="number"
            inputProps={{ min: 1, step: 1 }}
            value={durationMonths}
            onChange={(e) => setDurationMonths(e.target.value)}
            helperText="Optional. For full mode: full tenor length; for unpaid_only: remaining installments count."
          />

          {estimatedInstallment != null && loanPrincipal > 0 && (
            <Alert severity="info" variant="outlined" sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Estimated monthly installment (preview)
              </Typography>
              <Typography variant="h6" component="p" sx={{ mb: 0.5 }}>
                {fCurrency(estimatedInstallment)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Uses loan amount ({fCurrency(loanPrincipal)}) and{' '}
                {effectiveInterest != null || effectiveInsurance != null
                  ? 'interest / insurance rates from this application or bank defaults.'
                  : 'equal split (no rates on file).'}{' '}
                Final schedule is calculated by the server; use “Recalculate from bank rates” in full
                mode when applicable.
              </Typography>
            </Alert>
          )}

          <TextField
            label="Installment amount"
            size="small"
            fullWidth
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            value={installmentAmount}
            onChange={(e) => setInstallmentAmount(e.target.value)}
            helperText="Optional. Fixed amount per new installment."
          />

          <TextField
            label="First due date"
            type="date"
            size="small"
            fullWidth
            value={firstDueDate}
            onChange={(e) => setFirstDueDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Optional ISO date. Defaults depend on mode (e.g. ~1 month from now for full)."
          />

          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              px: 2,
              py: 1.5,
              bgcolor: mode === 'full' ? 'action.hover' : 'action.disabledBackground',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={recalculateFromRates}
                  onChange={(_e, v) => setRecalculateFromRates(v)}
                  disabled={mode !== 'full' || submitting}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Recalculate from bank rates
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Full mode only: recompute installment from loan amount, duration, and bank
                    interest / insurance.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', m: 0 }}
            />
          </Box>

          {formError && (
            <Typography variant="body2" color="error">
              {formError}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {submitting ? 'Submitting…' : 'Reschedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

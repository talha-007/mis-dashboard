import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useParams, useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import loanApplicationService from 'src/redux/services/loan-applications';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// API response types (detail GET)

interface AssessmentAnswer {
  question?: string;
  selectedAnswer?: string;
  pointsEarned?: number;
  text?: string;
  optionText?: string;
  points?: number;
  _id?: string;
}

interface Assessment {
  _id: string;
  answers?: AssessmentAnswer[];
  assessmentScore?: number;
  affordabilityScore?: number;
  creditScore?: number;
  finalCreditScore?: number;
  rating?: number;
  incomeTotal?: number;
  expenseTotal?: number;
  loanAmountAtScoring?: number;
  loanToDisposableIncomeRatio?: number;
  loanToExpenseRatio?: number;
  riskCategory?: string;
  riskGrade?: string;
  totalQuestions?: number;
  createdAt?: string;
}

interface Eligibility {
  eligible?: boolean;
  reason?: string;
  creditScore?: number;
  disposableIncome?: number;
  eligibleAmount?: number;
  recommendedAmount?: number;
  recommendedEMI?: number | null;
  eligibleEMI?: number | null;
  riskGrade?: string;
  riskCategory?: string;
  planDurationMonths?: number;
}

interface LoanApplication {
  _id: string;
  amount: number;
  assessmentId?: string;
  bankId?: string;
  city?: string;
  cnic?: string;
  createdAt?: string;
  customerId?: {
    _id: string;
    name?: string;
    lastname?: string;
    email?: string;
    phone?: string;
  };
  customerName?: string;
  durationMonths?: number;
  fatherName?: string;
  installmentAmount?: number;
  region?: string;
  status?: string;
  updatedAt?: string;
}

interface InstallmentItem {
  installmentNo: number;
  dueDate: string;
  amount: number;
  status?: string;
}

interface PaymentSchedule {
  installments?: InstallmentItem[];
  total?: number;
  note?: string;
  source?: string;
}

interface ProjectedPlan {
  installmentAmount?: number;
  interestRate?: number;
  insuranceRate?: number;
  totalInterest?: number;
  totalInsurance?: number;
  totalRepayment?: number;
  note?: string;
}

interface DetailResponse {
  loanApplication: LoanApplication;
  assessment?: Assessment;
  eligibility?: Eligibility;
  paymentSchedule?: PaymentSchedule;
  projectedPlan?: ProjectedPlan;
}

// Helper: key-value row for doc sections
function DocRow({
  label,
  value,
  valueBold,
}: {
  label: string;
  value: React.ReactNode;
  valueBold?: boolean;
}) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.75 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={valueBold ? 600 : 400}>
        {value}
      </Typography>
    </Stack>
  );
}

export function LoanApplicationDetailView() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) {
          setError('Application ID not found');
          return;
        }
        const response = await loanApplicationService.get(id as string);
        const raw = response.data?.data ?? response.data;
        if (raw?.loanApplication) {
          setData({
            loanApplication: raw.loanApplication,
            assessment: raw.assessment,
            eligibility: raw.eligibility,
            paymentSchedule: raw.paymentSchedule,
            projectedPlan: raw.projectedPlan,
          });
        } else if (raw?._id) {
          setData({
            loanApplication: raw as LoanApplication,
            assessment: raw.assessment,
            eligibility: raw.eligibility,
            paymentSchedule: raw.paymentSchedule,
            projectedPlan: raw.projectedPlan,
          });
        } else {
          setData(null);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || 'Failed to load application');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const application = data?.loanApplication;

  const handleApproveClick = () => {
    setDialogAction('approve');
    setOpenDialog(true);
  };

  const handleRejectClick = () => {
    setDialogAction('reject');
    setOpenDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!application || !id || !dialogAction) return;

    // Frontend validation to match backend requirement
    if (dialogAction === 'reject' && !rejectReason.trim()) {
      setError('Rejection reason is required when rejecting a loan application');
      return;
    }

    try {
      setActionInProgress(true);
      const payload: Record<string, unknown> = {
        status: dialogAction === 'approve' ? 'approved' : 'rejected',
      };
      if (dialogAction === 'reject') {
        payload.rejectionReason = rejectReason.trim();
      }

      await loanApplicationService.updateStatus(application._id, payload);

      const response = await loanApplicationService.get(id as string);
      const raw = response.data?.data ?? response.data;
      if (raw?.loanApplication) {
        setData({
          loanApplication: raw.loanApplication,
          assessment: raw.assessment,
          eligibility: raw.eligibility,
          paymentSchedule: raw.paymentSchedule,
          projectedPlan: raw.projectedPlan,
        });
      } else if (raw?._id) {
        setData({
          loanApplication: raw as LoanApplication,
          assessment: raw.assessment,
          eligibility: raw.eligibility,
          paymentSchedule: raw.paymentSchedule,
          projectedPlan: raw.projectedPlan,
        });
      }

      setOpenDialog(false);
      setRejectReason('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update application');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRejectReason('');
    setDialogAction(null);
  };

  const handleBack = () => {
    router.push('/loan-applications');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'under_review':
        return 'warning';
      case 'pending':
      case 'submitted':
        return 'info';
      default:
        return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'info.main';
    if (score >= 40) return 'warning.main';
    return 'error.main';
  };

  const isPending =
    application?.status === 'pending' ||
    application?.status === 'under_review' ||
    application?.status === 'submitted';

  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (!application) {
    return (
      <DashboardContent>
        <Alert severity="warning">Application not found.</Alert>
        <Button sx={{ mt: 2 }} onClick={handleBack}>
          Back to list
        </Button>
      </DashboardContent>
    );
  }

  const assessment = data?.assessment;
  const eligibility = data?.eligibility;
  const paymentSchedule = data?.paymentSchedule;
  const projectedPlan = data?.projectedPlan;
  const customerName =
    application.customerName ||
    (application.customerId
      ? [application.customerId.name, application.customerId.lastname].filter(Boolean).join(' ').trim()
      : '—');

  return (
    <DashboardContent>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4">Loan Application Details</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={handleBack}
          >
            Back
          </Button>
          {isPending && (
            <>
              <Button
                variant="contained"
                onClick={handleApproveClick}
                disabled={actionInProgress}
                sx={{ bgcolor: 'grey.800', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}
              >
                Approve Application
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleRejectClick}
                disabled={actionInProgress}
              >
                Reject Application
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* 1. Applicant & Loan Request */}
        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            1. Applicant & Loan Request
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline" color="text.secondary">
                Applicant
              </Typography>
              <DocRow label="Name" value={customerName} valueBold />
              <DocRow label="Father name" value={application.fatherName ?? '—'} />
              <DocRow label="CNIC" value={application.cnic ?? '—'} />
              <DocRow label="Email" value={application.customerId?.email ?? '—'} />
              <DocRow label="Phone" value={application.customerId?.phone ?? '—'} />
              <DocRow label="City" value={application.city ?? '—'} />
              <DocRow label="Region" value={application.region ?? '—'} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline" color="text.secondary">
                Loan
              </Typography>
              <DocRow label="Loan amount" value={fCurrency(application.amount)} valueBold />
              <DocRow label="Duration" value={`${application.durationMonths ?? '—'} months`} />
              <DocRow label="Monthly installment" value={fCurrency(application.installmentAmount ?? 0)} />
              <DocRow
                label="Status"
                value={
                  <Label color={getStatusColor(application.status ?? '')}>
                    {(application.status ?? '').toUpperCase().replace('_', ' ')}
                  </Label>
                }
              />
              <DocRow label="Applied" value={application.createdAt ? fDate(application.createdAt) : '—'} />
            </Grid>
          </Grid>
        </Card>

        {/* 2. Credit Assessment */}
        {assessment && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              2. Credit Assessment
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="overline" color="text.secondary">
                  Scores
                </Typography>
                <DocRow
                  label="Credit score"
                  value={
                    <Typography
                      component="span"
                      sx={{
                        color: getScoreColor(assessment.creditScore ?? assessment.rating ?? 0),
                        fontWeight: 600,
                      }}
                    >
                      {assessment.creditScore ?? assessment.rating ?? '—'}
                    </Typography>
                  }
                />
                <DocRow label="Assessment score" value={assessment.assessmentScore ?? '—'} />
                <DocRow label="Affordability score" value={assessment.affordabilityScore ?? '—'} />
                <DocRow label="Final credit score" value={assessment.finalCreditScore ?? '—'} />
                <DocRow label="Risk grade" value={assessment.riskGrade ?? '—'} />
                <DocRow label="Risk category" value={assessment.riskCategory ?? '—'} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="overline" color="text.secondary">
                  Income & expense
                </Typography>
                <DocRow label="Income total" value={assessment.incomeTotal != null ? fCurrency(assessment.incomeTotal) : '—'} />
                <DocRow label="Expense total" value={assessment.expenseTotal != null ? fCurrency(assessment.expenseTotal) : '—'} />
                <DocRow label="Loan at scoring" value={assessment.loanAmountAtScoring != null ? fCurrency(assessment.loanAmountAtScoring) : '—'} />
                <DocRow label="Loan / disposable income" value={assessment.loanToDisposableIncomeRatio != null ? Number(assessment.loanToDisposableIncomeRatio).toFixed(2) : '—'} />
                <DocRow label="Loan / expense ratio" value={assessment.loanToExpenseRatio != null ? Number(assessment.loanToExpenseRatio).toFixed(2) : '—'} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <DocRow label="Total questions" value={assessment.totalQuestions ?? '—'} />
                <DocRow label="Assessment date" value={assessment.createdAt ? fDate(assessment.createdAt) : '—'} />
              </Grid>
            </Grid>
            {assessment.answers && assessment.answers.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Q&A
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Question</TableCell>
                        <TableCell>Answer</TableCell>
                        <TableCell align="right">Points</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assessment.answers.map((a, i) => (
                        <TableRow key={a._id ?? i}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{(a as any).question ?? a.text ?? '—'}</TableCell>
                          <TableCell>{(a as any).selectedAnswer ?? a.optionText ?? '—'}</TableCell>
                          <TableCell align="right">{a.pointsEarned ?? a.points ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Card>
        )}

        {/* 3. Eligibility */}
        {eligibility && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              3. Eligibility
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <DocRow
                label="Eligible"
                value={
                  <Label color={eligibility.eligible ? 'success' : 'error'}>
                    {eligibility.eligible ? 'Yes' : 'No'}
                  </Label>
                }
              />
              {eligibility.reason && (
                <DocRow label="Reason" value={eligibility.reason} />
              )}
              <DocRow label="Credit score" value={eligibility.creditScore ?? '—'} />
              <DocRow label="Disposable income" value={eligibility.disposableIncome != null ? fCurrency(eligibility.disposableIncome) : '—'} />
              <DocRow label="Eligible amount" value={eligibility.eligibleAmount != null ? fCurrency(eligibility.eligibleAmount) : '—'} />
              <DocRow label="Recommended amount" value={eligibility.recommendedAmount != null ? fCurrency(eligibility.recommendedAmount) : '—'} />
              <DocRow label="Recommended EMI" value={eligibility.recommendedEMI != null ? fCurrency(eligibility.recommendedEMI) : '—'} />
              <DocRow label="Risk grade" value={eligibility.riskGrade ?? '—'} />
              <DocRow label="Risk category" value={eligibility.riskCategory ?? '—'} />
              <DocRow label="Plan duration (months)" value={eligibility.planDurationMonths ?? '—'} />
            </Stack>
          </Card>
        )}

        {/* 4. Projected Plan */}
        {projectedPlan && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              4. Projected Plan
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {projectedPlan.note ?? 'Projected at current bank rates. Final values are set upon approval.'}
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DocRow label="Installment amount" value={projectedPlan.installmentAmount != null ? fCurrency(projectedPlan.installmentAmount) : '—'} valueBold />
                <DocRow label="Interest rate" value={projectedPlan.interestRate != null ? `${projectedPlan.interestRate}%` : '—'} />
                <DocRow label="Insurance rate" value={projectedPlan.insuranceRate != null ? `${projectedPlan.insuranceRate}%` : '—'} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DocRow label="Total interest" value={projectedPlan.totalInterest != null ? fCurrency(projectedPlan.totalInterest) : '—'} />
                <DocRow label="Total insurance" value={projectedPlan.totalInsurance != null ? fCurrency(projectedPlan.totalInsurance) : '—'} />
                <DocRow label="Total repayment" value={projectedPlan.totalRepayment != null ? fCurrency(projectedPlan.totalRepayment) : '—'} valueBold />
              </Grid>
            </Grid>
          </Card>
        )}

        {/* 5. Payment Schedule */}
        {paymentSchedule?.installments && paymentSchedule.installments.length > 0 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              5. Payment Schedule
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {paymentSchedule.note && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {paymentSchedule.note}
              </Typography>
            )}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Due date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentSchedule.installments.map((inst) => (
                    <TableRow key={inst.installmentNo}>
                      <TableCell>{inst.installmentNo}</TableCell>
                      <TableCell>{fDate(inst.dueDate)}</TableCell>
                      <TableCell align="right">{fCurrency(inst.amount)}</TableCell>
                      <TableCell>
                        <Label color={inst.status === 'paid' ? 'success' : 'default'}>
                          {inst.status ?? 'projected'}
                        </Label>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {paymentSchedule.total != null && (
              <Typography variant="body2" sx={{ mt: 2 }} fontWeight={600}>
                Total installments: {paymentSchedule.total}
              </Typography>
            )}
          </Card>
        )}
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
            {dialogAction === 'approve' ? 'Approve Application' : 'Reject Application'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Typography variant="body2">
              {dialogAction === 'approve'
                ? 'Are you sure you want to approve this loan application?'
                : 'Are you sure you want to reject this loan application?'}
            </Typography>
            {dialogAction === 'reject' && (
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label="Rejection Reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={actionInProgress}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            disabled={actionInProgress}
            variant="contained"
            color={dialogAction === 'approve' ? 'primary' : 'error'}
            startIcon={actionInProgress ? <CircularProgress size={20} /> : undefined}
          >
            {actionInProgress ? 'Processing...' : dialogAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

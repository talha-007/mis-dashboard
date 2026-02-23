import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
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

interface AssessmentAnswer {
  question: string;
  selectedAnswer: string;
  pointsEarned: number;
  isCorrect: boolean;
  _id: string;
}

interface Assessment {
  _id: string;
  answers: AssessmentAnswer[];
  correctAnswers: number;
  creditScore: number;
  earnedPoints: number;
  rating: number;
  totalPoints: number;
  totalQuestions: number;
  createdAt: string;
}

interface LoanApplicationDetail {
  _id: string;
  amount: number;
  assessmentId: string;
  bankId: string;
  city: string;
  cnic: string;
  createdAt: string;
  customerId: {
    _id: string;
    name: string;
    lastname: string;
    email: string;
    phone: string;
  };
  customerName: string;
  durationMonths: number;
  fatherName: string;
  installmentAmount: number;
  region: string;
  status: string;
  updatedAt: string;
  assessment?: Assessment;
}

export function LoanApplicationDetailView() {
  const { id } = useParams();
  const router = useRouter();

  const [application, setApplication] = useState<LoanApplicationDetail | null>(null);
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

        if (response.status === 200) {
          // The API returns: { data: { loanApplication: {...}, assessment: {...} } }
          const responseData = response.data?.data || response.data;

          if (responseData) {
            // Combine loan application and assessment data
            const loanApp = responseData.loanApplication || responseData;
            const assessment = responseData.assessment;

            setApplication({
              ...loanApp,
              assessment: assessment || undefined,
            });
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleApproveClick = () => {
    setDialogAction('approve');
    setOpenDialog(true);
  };

  const handleRejectClick = () => {
    setDialogAction('reject');
    setOpenDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!application || !id) return;

    try {
      setActionInProgress(true);
      const payload: Record<string, unknown> = {
        status: dialogAction === 'approve' ? 'approved' : 'rejected',
      };
      if (dialogAction === 'reject' && rejectReason) {
        payload.rejectionReason = rejectReason;
      }

      await loanApplicationService.updateStatus(application._id, payload);

      // Refetch the updated application data
      const response = await loanApplicationService.get(id as string);
      if (response.status === 200) {
        const responseData = response.data?.data || response.data;
        if (responseData) {
          const loanApp = responseData.loanApplication || responseData;
          const assessment = responseData.assessment;
          setApplication({
            ...loanApp,
            assessment: assessment || undefined,
          });
        }
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
        {/* Customer & Application Info */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Customer & Application
          </Typography>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Customer
              </Typography>
              <Typography variant="body1">
                {application.customerName ||
                  (application.customerId
                    ? `${application.customerId.name || ''} ${application.customerId.lastname || ''}`.trim()
                    : 'N/A')}
              </Typography>
              {application.customerId?.email && (
                <Typography variant="body2" color="text.secondary">
                  {application.customerId.email}
                </Typography>
              )}
              {application.customerId?.phone && (
                <Typography variant="body2" color="text.secondary">
                  {application.customerId.phone}
                </Typography>
              )}
            </Box>
            <Divider />
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Loan Amount
                </Typography>
                <Typography variant="h6">{fCurrency(application.amount)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">{application.durationMonths} months</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Monthly Installment
                </Typography>
                <Typography variant="body1">{fCurrency(application.installmentAmount)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Label color={getStatusColor(application.status)}>
                    {application.status.toUpperCase().replace('_', ' ')}
                  </Label>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Applied Date
                </Typography>
                <Typography variant="body2">{fDate(application.createdAt)}</Typography>
              </Box>
            </Stack>
          </Stack>
        </Card>

        {/* Applicant Information */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Applicant Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1">{application.customerName || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Father Name
                </Typography>
                <Typography variant="body1">{application.fatherName || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  CNIC
                </Typography>
                <Typography variant="body1">{application.cnic || 'N/A'}</Typography>
              </Box>
            </Stack>
            <Divider />
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{application.customerId?.email || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{application.customerId?.phone || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  City
                </Typography>
                <Typography variant="body1">{application.city || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Region
                </Typography>
                <Typography variant="body1">{application.region || 'N/A'}</Typography>
              </Box>
            </Stack>
          </Stack>
        </Card>

        {/* Assessment Score */}
        {application.assessment && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Credit Assessment
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Credit Score
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    color: getScoreColor(
                      application.assessment.creditScore || application.assessment.rating
                    ),
                    fontWeight: 600,
                  }}
                >
                  {application.assessment.creditScore || application.assessment.rating}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Points Earned
                </Typography>
                <Typography variant="h6">
                  {application.assessment.earnedPoints} / {application.assessment.totalPoints}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Rating
                </Typography>
                <Typography variant="h6">{application.assessment.rating}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Correct Answers
                </Typography>
                <Typography variant="h6">
                  {application.assessment.correctAnswers} / {application.assessment.totalQuestions}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Assessment Date
                </Typography>
                <Typography variant="body2">{fDate(application.assessment.createdAt)}</Typography>
              </Box>
            </Stack>
          </Card>
        )}

        {/* Assessment Answers */}
        {application.assessment &&
          application.assessment.answers &&
          application.assessment.answers.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Assessment Answers
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {application.assessment.answers.map((answer, index) => (
                      <TableRow key={answer._id || index}>
                        <TableCell sx={{ fontWeight: 500, width: '40%' }}>
                          {answer.question}
                        </TableCell>
                        <TableCell>{answer.selectedAnswer}</TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                            alignItems="center"
                          >
                            <Typography variant="body2">{answer.pointsEarned} pts</Typography>
                            {answer.isCorrect ? (
                              <Iconify
                                icon="eva:checkmark-circle-2-fill"
                                width={20}
                                sx={{ color: 'success.main' }}
                              />
                            ) : (
                              <Iconify
                                icon="eva:close-circle-2-fill"
                                width={20}
                                sx={{ color: 'error.main' }}
                              />
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
                multiline
                rows={3}
                label="Rejection Reason (Optional)"
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

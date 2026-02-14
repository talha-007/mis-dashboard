/**
 * Assessment module services.
 * Uses mock data until APIs are ready; replace with callAPi when backend is available.
 */

import type {
  BankAssessment,
  AssessmentAnswer,
  CustomFieldValue,
  AssessmentSubmission,
  CreditProposalReport,
} from 'src/types/assessment.types';

import { _bankAssessment } from 'src/_mock/_assessment';
import { _creditProposalReports } from 'src/_mock/_credit-proposal-report';

// ----------------------------------------------------------------------
// Bank assessment (admin)
// ----------------------------------------------------------------------

function computeTotalMaxScore(questions: BankAssessment['questions']): number {
  return questions.reduce((sum, q) => {
    if (q.type === 'multiple_choice' && q.options?.length) {
      return sum + Math.max(...q.options.map((o) => o.points));
    }
    return sum;
  }, 0);
}

export function getBankAssessment(_bankId?: string): Promise<{ data: BankAssessment }> {
  const data = JSON.parse(JSON.stringify(_bankAssessment));
  data.totalMaxScore = computeTotalMaxScore(data.questions);
  return Promise.resolve({ data });
}

export function updateBankAssessment(
  _bankId: string,
  payload: { questions: BankAssessment['questions'] }
): Promise<{ data: BankAssessment }> {
  const totalMaxScore = computeTotalMaxScore(payload.questions);
  return Promise.resolve({
    data: { ..._bankAssessment, questions: payload.questions, totalMaxScore },
  });
}

// ----------------------------------------------------------------------
// Customer assessment submission
// ----------------------------------------------------------------------

export function getAssessmentForCustomer(_bankId?: string): Promise<{ data: BankAssessment }> {
  return getBankAssessment(_bankId);
}

export function submitAssessment(
  answers: AssessmentAnswer[],
  customFieldValues?: CustomFieldValue[],
  totalMaxScore?: number
): Promise<{ data: AssessmentSubmission }> {
  const totalScore = totalMaxScore ?? 100;
  const score = answers.reduce((sum, a) => sum + a.points, 0);
  const submission: AssessmentSubmission = {
    _id: `sub-${Date.now()}`,
    customerId: 'current-customer',
    bankId: 'bank-001',
    score,
    totalScore,
    answers,
    customFieldValues: customFieldValues ?? [],
    submittedAt: new Date().toISOString(),
  };
  return Promise.resolve({ data: submission });
}

export function getMyLatestSubmission(): Promise<{ data: AssessmentSubmission | null }> {
  return Promise.resolve({
    data: {
      _id: 'sub-latest',
      customerId: 'current-customer',
      bankId: 'bank-001',
      score: 72,
      totalScore: 100,
      answers: [],
      submittedAt: new Date().toISOString(),
    },
  });
}

// ----------------------------------------------------------------------
// Credit proposal reports (admin)
// ----------------------------------------------------------------------

export function getCreditProposalReports(_params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<{ data: CreditProposalReport[] }> {
  return Promise.resolve({ data: [..._creditProposalReports] });
}

export function getCreditProposalReportById(
  id: string
): Promise<{ data: CreditProposalReport | null }> {
  const report = _creditProposalReports.find((r) => r._id === id) ?? null;
  const full = report
    ? {
        ...report,
        answersSnapshot: report.answersSnapshot ?? [],
      }
    : null;
  return Promise.resolve({ data: full });
}

export function approveLoanApplication(reportId: string): Promise<{ data: { success: boolean } }> {
  return Promise.resolve({ data: { success: true } });
}

export function rejectLoanApplication(reportId: string): Promise<{ data: { success: boolean } }> {
  return Promise.resolve({ data: { success: true } });
}

// Default export for consistency with other services
const assessmentService = {
  getBankAssessment,
  updateBankAssessment,
  getAssessmentForCustomer,
  submitAssessment,
  getMyLatestSubmission,
  getCreditProposalReports,
  getCreditProposalReportById,
  approveLoanApplication,
  rejectLoanApplication,
};

export default assessmentService;

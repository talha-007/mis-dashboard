import type {
  BankAssessment,
  AssessmentAnswer,
  CustomFieldValue,
  AssessmentSubmission,
  CreditProposalReport,
} from 'src/types/assessment.types';

import bankAdminService from './bank-admin.services';
import systemUserService from './system-user.services';

/**
 * Assessment Service (facade + mapping)
 * Bank Admin: get/update bank questions. System User: submit assessment, my assessments.
 * Endpoints: /api/v1/bankAdmin/bank-questions, /api/v1/systemUser/assessments
 */

function mapToBankAssessment(raw: any): BankAssessment {
  const questions: BankAssessment['questions'] = (raw?.questions ?? []).map(
    (q: any, index: number) => {
      if (q.type === 'multiple_choice') {
        return {
          _id: String(q._id ?? q.id ?? index),
          type: 'multiple_choice' as const,
          text: q.text,
          order: q.order ?? index + 1,
          options: (q.options ?? []).map((o: any, i: number) => ({
            _id: String(o._id ?? o.id ?? i),
            text: o.text ?? o.label ?? '',
            points: Number(o.points ?? o.value ?? o.score ?? 0),
          })),
        };
      }
      return {
        _id: String(q._id ?? q.id ?? index),
        type: 'custom_field' as const,
        fieldKey: q.fieldKey ?? q.label ?? `field_${index + 1}`,
        label: q.label ?? q.fieldKey ?? `Field ${index + 1}`,
        inputType: q.inputType === 'text' ? 'text' : 'number',
        order: q.order ?? index + 1,
        unit: q.unit,
      };
    }
  );
  const totalMaxScore = questions.reduce((sum, q) => {
    if (q.type === 'multiple_choice' && q.options?.length) {
      return sum + Math.max(...q.options.map((o) => o.points));
    }
    return sum;
  }, 0);
  const bankId =
    typeof raw?.bankId === 'object' && raw?.bankId?._id
      ? String(raw.bankId._id)
      : String(raw?.bankId ?? 'current-bank');
  return {
    bankId,
    questions,
    totalMaxScore,
  };
}

const getBankAssessment = (_bankId?: string) =>
  bankAdminService.getBankQuestions().then((res) => {
    const body = res.data?.data ?? res.data;
    const bankQuestions = body?.bankQuestions ?? body;
    return { data: mapToBankAssessment(bankQuestions) };
  });

const updateBankAssessment = (
  _bankId: string,
  payload: { questions: BankAssessment['questions'] }
) => {
  const body = {
    questions: payload.questions.map((q, index) => {
      if (q.type === 'multiple_choice') {
        return {
          type: 'multiple_choice' as const,
          text: q.text,
          order: q.order ?? index + 1,
          options: q.options.map((o) => ({ text: o.text, points: o.points })),
        };
      }
      return {
        type: 'custom_field' as const,
        fieldKey: q.fieldKey,
        label: q.label,
        inputType: q.inputType,
        order: q.order ?? index + 1,
        unit: q.unit,
      };
    }),
  };
  return bankAdminService.createOrUpdateBankQuestions(body).then((res) => ({
    data: mapToBankAssessment(res.data?.data ?? res.data),
  }));
};

const getAssessmentForCustomer = (bankId?: string) =>
  bankId
    ? bankAdminService.getBankQuestionsForCustomer(bankId).then((res) => ({
        data: mapToBankAssessment(res.data?.data ?? res.data),
      }))
    : getBankAssessment();

const submitAssessment = (
  answers: AssessmentAnswer[],
  customFieldValues?: CustomFieldValue[],
  totalMaxScore?: number
) => {
  const totalScore = totalMaxScore ?? 100;
  const score = answers.reduce((sum, a) => sum + a.points, 0);
  const payload = {
    score,
    totalScore,
    answers,
    customFieldValues: customFieldValues ?? [],
  };
  return systemUserService.submitAssessment(payload).then((res) => ({
    data: (res.data?.data ?? res.data) as AssessmentSubmission,
  }));
};

const getMyLatestSubmission = () =>
  systemUserService.getMyAssessments().then((res) => {
    const list = res.data?.data ?? res.data;
    const arr = Array.isArray(list) ? list : (list?.assessments ?? []);
    const latest = arr[0] ?? null;
    return { data: latest as AssessmentSubmission | null };
  });

// Credit proposal reports – not in README; placeholder for UI
const getCreditProposalReports = (_params?: any): Promise<{ data: CreditProposalReport[] }> =>
  Promise.resolve({ data: [] });

const getCreditProposalReportById = (_id: string): Promise<{ data: CreditProposalReport | null }> =>
  Promise.resolve({ data: null });

const approveLoanApplication = (reportId: string) => Promise.resolve({ data: { success: true } });
const rejectLoanApplication = (reportId: string) => Promise.resolve({ data: { success: true } });

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

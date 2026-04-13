import type { BankAssessment, AssessmentSubmitAnswer } from 'src/types/assessment.types';

import { callAPi } from '../http-common';
import customerService from '../customer/customer.services';
import bankAdminService from '../bank-admin/bank-admin.services';

function mapToBankAssessment(raw: any): BankAssessment {
  const questions: BankAssessment['questions'] = (raw?.questions ?? []).map(
    (q: any, index: number) => {
      if (q.type === 'multiple_choice') {
        return {
          _id: String(q._id ?? q.id ?? index),
          type: 'multiple_choice' as const,
          text: q.text,
          order: q.order ?? index + 1,
          questionType: q.questionType === 'expense' ? 'expense' : 'income',
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
        inputType: 'number' as const,
        order: q.order ?? index + 1,
        unit: q.unit,
        questionType: q.questionType === 'expense' ? 'expense' : 'income',
        allowFreeText: Boolean(q.allowFreeText),
        freeTextLabel: typeof q.freeTextLabel === 'string' ? q.freeTextLabel : undefined,
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

const getBankAssessment = () =>
  bankAdminService.getBankQuestions().then((res) => {
    const body = res.data?.data ?? res.data;
    const bankQuestions = body?.bankQuestions ?? body;
    return { data: mapToBankAssessment(bankQuestions) };
  });

const getAssessmentForCustomer = (bankSlug?: string) =>
  customerService.getBankQuestionsForCustomer(bankSlug || '').then((res) => {
    const body = res.data?.data ?? res.data;
    const bankQuestions = body?.bankQuestions ?? body;
    return { data: mapToBankAssessment(bankQuestions) };
  });

const submitAssessment = (bankSlug: string, answers: AssessmentSubmitAnswer[]) =>
  customerService.submitAssessmentAnswers({ bankSlug, answers });

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
          questionType: q.questionType ?? 'income',
          options: q.options.map((o) => ({ text: o.text, points: o.points })),
        };
      }
      return {
        type: 'custom_field' as const,
        fieldKey: q.fieldKey,
        label: q.label,
        inputType: 'number' as const,
        order: q.order ?? index + 1,
        unit: q.unit,
        questionType: q.questionType ?? 'income',
        allowFreeText: Boolean(q.allowFreeText),
        ...(q.allowFreeText && q.freeTextLabel ? { freeTextLabel: q.freeTextLabel } : {}),
      };
    }),
  };

  return bankAdminService.createOrUpdateBankQuestions(body).then((res) => ({
    data: mapToBankAssessment(res.data?.data ?? res.data),
  }));
};

const getCreditProposalReports = (params?: any) =>
  callAPi.get('/api/v1/bankAdmin/credit-proposal-reports', { params });

const getCreditProposalReportById = (id: string) =>
  callAPi.get(`/api/v1/bankAdmin/credit-proposal-reports/${id}`);

const approveLoanApplication = (reportId: string) =>
  callAPi.post(`/api/v1/bankAdmin/credit-proposal-reports/${reportId}/approve`);

const rejectLoanApplication = (reportId: string) =>
  callAPi.post(`/api/v1/bankAdmin/credit-proposal-reports/${reportId}/reject`);

const assessmentService = {
  getBankAssessment,
  getAssessmentForCustomer,
  submitAssessment,
  updateBankAssessment,
  getCreditProposalReports,
  getCreditProposalReportById,
  approveLoanApplication,
  rejectLoanApplication,
};

export default assessmentService;

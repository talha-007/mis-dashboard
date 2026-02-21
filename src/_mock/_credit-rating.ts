export type CreditRating = {
  id: string;
  borrowerName: string;
  borrowerId: string;
  loanAmount: number;
  creditScore: number;
  riskCategory: 'High Risk' | 'Moderate Risk' | 'Low Risk';
  lastAssessment: string;
  status: 'active' | 'inactive' | 'under_review';
};

export const _creditRatings: CreditRating[] = [];

export const creditRatingSummary = {
  highRisk: 0,
  moderateRisk: 0,
  lowRisk: 0,
  total: 0,
};

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

export const _creditRatings: CreditRating[] = [
  {
    id: 'cr-001',
    borrowerName: 'John Doe',
    borrowerId: 'BRW-2024-001',
    loanAmount: 50000,
    creditScore: 350,
    riskCategory: 'High Risk',
    lastAssessment: '2024-01-15',
    status: 'active',
  },
  {
    id: 'cr-002',
    borrowerName: 'Jane Smith',
    borrowerId: 'BRW-2024-002',
    loanAmount: 75000,
    creditScore: 680,
    riskCategory: 'Low Risk',
    lastAssessment: '2024-01-20',
    status: 'active',
  },
  {
    id: 'cr-003',
    borrowerName: 'Robert Johnson',
    borrowerId: 'BRW-2024-003',
    loanAmount: 120000,
    creditScore: 520,
    riskCategory: 'Moderate Risk',
    lastAssessment: '2024-01-18',
    status: 'active',
  },
  {
    id: 'cr-004',
    borrowerName: 'Emily Davis',
    borrowerId: 'BRW-2024-004',
    loanAmount: 200000,
    creditScore: 720,
    riskCategory: 'Low Risk',
    lastAssessment: '2024-01-22',
    status: 'active',
  },
  {
    id: 'cr-005',
    borrowerName: 'Michael Wilson',
    borrowerId: 'BRW-2024-005',
    loanAmount: 45000,
    creditScore: 420,
    riskCategory: 'High Risk',
    lastAssessment: '2024-01-14',
    status: 'under_review',
  },
  {
    id: 'cr-006',
    borrowerName: 'Sarah Brown',
    borrowerId: 'BRW-2024-006',
    loanAmount: 95000,
    creditScore: 590,
    riskCategory: 'Moderate Risk',
    lastAssessment: '2024-01-19',
    status: 'active',
  },
  {
    id: 'cr-007',
    borrowerName: 'David Martinez',
    borrowerId: 'BRW-2024-007',
    loanAmount: 150000,
    creditScore: 710,
    riskCategory: 'Low Risk',
    lastAssessment: '2024-01-21',
    status: 'active',
  },
  {
    id: 'cr-008',
    borrowerName: 'Jessica Garcia',
    borrowerId: 'BRW-2024-008',
    loanAmount: 80000,
    creditScore: 550,
    riskCategory: 'Moderate Risk',
    lastAssessment: '2024-01-17',
    status: 'active',
  },
  {
    id: 'cr-009',
    borrowerName: 'James Anderson',
    borrowerId: 'BRW-2024-009',
    loanAmount: 60000,
    creditScore: 380,
    riskCategory: 'High Risk',
    lastAssessment: '2024-01-16',
    status: 'active',
  },
  {
    id: 'cr-010',
    borrowerName: 'Linda Taylor',
    borrowerId: 'BRW-2024-010',
    loanAmount: 110000,
    creditScore: 670,
    riskCategory: 'Low Risk',
    lastAssessment: '2024-01-23',
    status: 'active',
  },
];

// Summary data based on the numbers provided
export const creditRatingSummary = {
  highRisk: 312,
  moderateRisk: 2840,
  lowRisk: 9328,
  total: 12480,
};

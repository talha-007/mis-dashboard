export interface CustomerLoanApplication {
  id: string;
  customerName: string;
  fatherName: string;
  cnic: string;
  city: string;
  region: string;
  loanAmount: number;
  installmentAmount: number;
  // Income
  businessIncome: number;
  investmentIncome: number;
  salaryIncome: number;
  houseRental: number;
  carRental: number;
  // Expenses
  utilitiesBill: number;
  installmentsOther: number;
  fuelExpenses: number;
  groceryExpenses: number;
  medicalBills: number;
  insurance: number;
  fees: number;
  otherExpenses: number;
  miscellaneous: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export const _customerLoanApplications: CustomerLoanApplication[] = [];

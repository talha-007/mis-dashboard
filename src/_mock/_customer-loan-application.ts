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

export const _customerLoanApplications: CustomerLoanApplication[] = [
  {
    id: 'APP-001',
    customerName: 'Ahmed Ali',
    fatherName: 'Muhammad Ali',
    cnic: '42301-1234567-8',
    city: 'Lahore',
    region: 'Punjab',
    loanAmount: 200000,
    installmentAmount: 8333,
    businessIncome: 50000,
    investmentIncome: 10000,
    salaryIncome: 0,
    houseRental: 0,
    carRental: 0,
    utilitiesBill: 5000,
    installmentsOther: 10000,
    fuelExpenses: 8000,
    groceryExpenses: 15000,
    medicalBills: 3000,
    insurance: 2000,
    fees: 1000,
    otherExpenses: 5000,
    miscellaneous: 2000,
    status: 'submitted',
    createdAt: '2024-01-28',
    updatedAt: '2024-01-28',
  },
];

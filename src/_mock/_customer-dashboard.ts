/**
 * Mock Customer Dashboard Data
 */

export const customerDashboardStats = {
  activeLoan: {
    amount: 200000,
    currency: 'PKR',
  },
  nextInstallment: {
    amount: 18500,
    currency: 'PKR',
  },
  dueDate: '15 Oct',
  loanDetails: {
    totalTenure: '24 Months',
    paid: 8,
    remaining: 16,
    status: 'On Track',
  },
};

export type CustomerDashboardStats = typeof customerDashboardStats;

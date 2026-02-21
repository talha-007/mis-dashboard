export const customerDashboardStats = {
  activeLoan: { amount: 0, currency: 'PKR' as const },
  nextInstallment: { amount: 0, currency: 'PKR' as const },
  dueDate: '',
  loanDetails: { totalTenure: '', paid: 0, remaining: 0, status: '' },
};

export type CustomerDashboardStats = typeof customerDashboardStats;

import { callAPi } from './http-common';

/**
 * Bank Admin Service
 * Handles API calls for Bank Admin role: auth, banks, borrowers, loan-applications,
 * assessments, bank-questions, payment-ledgers, recovery-overdues, installments, subscriptions.
 * Endpoints: /api/v1/bankAdmin/*
 */

// --- Bank Auth (public) ---
const login = (data: any) => callAPi.post('/api/v1/bankAdmin/banks/login', data);
// Unified auth endpoints (work for both customers and bank admins)
const forgotPassword = (data: any) => callAPi.post('/api/auth/forgot-password', data);
const resendOtp = (data: any) => callAPi.post('/api/v1/bankAdmin/banks/resend-otp', data);
const verifyOtp = (data: any) => callAPi.post('/api/auth/verify-otp', data);
const resetPassword = (data: any) => callAPi.post('/api/auth/reset-password', data);
const googleLogin = (data: any) => callAPi.post('/api/v1/bankAdmin/banks/google-login', data);

// --- Bank (update) ---
const updateBank = (id: string, data: any) => callAPi.put(`/api/v1/bankAdmin/banks/${id}`, data);

// --- Borrowers ---
const createBorrower = (data: any) => callAPi.post('/api/v1/bankAdmin/borrowers', data);
const getBorrowers = (params?: any) => callAPi.get('/api/v1/bankAdmin/borrowers', { params });
const getBorrowerById = (id: string) => callAPi.get(`/api/v1/bankAdmin/borrowers/${id}`);
const updateBorrower = (id: string, data: any) =>
  callAPi.put(`/api/v1/bankAdmin/borrowers/${id}`, data);
const deleteBorrower = (id: string) => callAPi.delete(`/api/v1/bankAdmin/borrowers/${id}`);

// --- Loan Applications ---
const getLoanApplications = (params?: any) =>
  callAPi.get('/api/v1/bankAdmin/loan-applications', { params });
const getLoanApplicationById = (id: string) =>
  callAPi.get(`/api/v1/bankAdmin/loan-applications/${id}`);
const updateLoanApplication = (id: string, data: any) =>
  callAPi.put(`/api/v1/bankAdmin/loan-applications/${id}`, data);
const deleteLoanApplication = (id: string) =>
  callAPi.delete(`/api/v1/bankAdmin/loan-applications/${id}`);
const updateLoanApplicationStatus = (id: string, data: any) =>
  callAPi.put(`/api/v1/bankAdmin/loan-applications/${id}/status`, data);

// --- Assessments ---
const getAssessments = (params?: any) => callAPi.get('/api/v1/bankAdmin/assessments', { params });

// --- Bank Questions ---
const getBankQuestions = () => callAPi.get('/api/v1/bankAdmin/bank-questions');
const createOrUpdateBankQuestions = (data: any) =>
  callAPi.post('/api/v1/bankAdmin/bank-questions', data);
const toggleBankQuestionsStatus = (data: any) =>
  callAPi.put('/api/v1/bankAdmin/bank-questions/toggle-status', data);
const addQuestion = (data: any) =>
  callAPi.post('/api/v1/bankAdmin/bank-questions/add-question', data);
const updateQuestion = (questionIndex: number, data: any) =>
  callAPi.put(`/api/v1/bankAdmin/bank-questions/update-question/${questionIndex}`, data);
const removeQuestion = (questionIndex: number) =>
  callAPi.delete(`/api/v1/bankAdmin/bank-questions/remove-question/${questionIndex}`);
const getBankQuestionsForCustomer = (bankId: string) =>
  callAPi.get(`/api/v1/bankAdmin/customer/${bankId}`);

// --- Payment Ledgers ---
const createPaymentLedger = (data: any) => callAPi.post('/api/v1/bankAdmin/payment-ledgers', data);
const getPaymentLedgers = (params?: any) =>
  callAPi.get('/api/v1/bankAdmin/payment-ledgers', { params });
const getPaymentLedgerById = (id: string) => callAPi.get(`/api/v1/bankAdmin/payment-ledgers/${id}`);
const updatePaymentLedger = (id: string, data: any) =>
  callAPi.put(`/api/v1/bankAdmin/payment-ledgers/${id}`, data);
const deletePaymentLedger = (id: string) =>
  callAPi.delete(`/api/v1/bankAdmin/payment-ledgers/${id}`);

// Get all payments (recovery, penalty, fee)
const getAllPayments = (params?: any) =>
  callAPi.get('/api/v1/bankAdmin/payment-ledgers/all-payments', { params });

// --- Recovery Overdues ---
const createRecoveryOverdue = (data: any) =>
  callAPi.post('/api/v1/bankAdmin/recovery-overdues', data);
const getRecoveryOverdues = (params?: any) =>
  callAPi.get('/api/v1/bankAdmin/recovery-overdues', { params });
const getRecoveryOverdueById = (id: string) =>
  callAPi.get(`/api/v1/bankAdmin/recovery-overdues/${id}`);
const updateRecoveryOverdue = (id: string, data: any) =>
  callAPi.put(`/api/v1/bankAdmin/recovery-overdues/${id}`, data);
const deleteRecoveryOverdue = (id: string) =>
  callAPi.delete(`/api/v1/bankAdmin/recovery-overdues/${id}`);

// --- Installments ---
const getInstallmentsByCustomerId = (customerId: string) =>
  callAPi.get(`/api/v1/bankAdmin/installments/${customerId}`);

// Get recovery overview (dues and overdues)
const getRecoveryOverview = (params?: any) =>
  callAPi.get('/api/v1/bankAdmin/installments/recovery-overview', { params });

// --- Users (General) ---
const createUser = (data: any) => callAPi.post('/api/users/general', data);
const getUsers = (params?: any) => callAPi.get('/api/users/general', { params });
const getUserById = (userId: string) => callAPi.get(`/api/users/general/${userId}`);
const updateUser = (userId: string, data: any) => callAPi.put(`/api/users/general/${userId}`, data);
const deleteUser = (userId: string) => callAPi.delete(`/api/users/general/${userId}`);

// --- Subscriptions (create - Bank Token) ---
const createSubscription = (data: any) => callAPi.post('/api/v1/subscriptions', data);

// get customer's loan applications
const getCustomerLoanApplications = (params?: any) =>
  callAPi.get('/api/loan-applications', { params });

// get due installment
const getDueInstallment = () => callAPi.get(`/api/installments/due`);

// pay installment
const payInstallment = (installmentId: string) =>
  callAPi.post(`/api/installments/repay`, { installmentId });

// get installment history
const getInstallmentHistory = (params?: any) =>
  callAPi.get('/api/installments/history', { params });

// --- Bank Settings ---
const getBankSettings = () =>
  callAPi.get('/api/v1/bankAdmin/settings').then((res) => {
    console.log('res', res);
    const data = res.data?.settings;
    return {
      insuranceRate: Number(data?.insuranceRate  ?? 0),
      interestRate: Number(data?.interestRate  ?? 0),
    };
  });
const updateBankSettings = (data: { insuranceRate: number; interestRate: number }) =>
  callAPi.put('/api/v1/bankAdmin/settings', {
    insuranceRate: data.insuranceRate,
    interestRate: data.interestRate,
  });

// --- Stats ---
const getStats = () => callAPi.get('/api/v1/stats/bank-admin');
const getAdditionalStats = () => callAPi.get('/api/v1/stats/bank-admin/additional');
const getGraphsData = (params?: { days?: number }) =>
  callAPi.get('/api/v1/stats/bank-admin/graphs', { params });
const getCreditRatingOverview = (params?: any) =>
  callAPi.get('/api/v1/bankAdmin/credit-ratings/overview', { params });

// --- Employees (Recovery officers & staff) ---
const createEmployee = (data: any) => callAPi.post('/api/v1/bankAdmin/employees', data);
const getEmployees = (params?: any) =>
  callAPi.get('/api/v1/bankAdmin/employees', { params });
const getEmployeeById = (id: string) =>
  callAPi.get(`/api/v1/bankAdmin/employees/${id}`);
const updateEmployee = (id: string, data: any) =>
  callAPi.put(`/api/v1/bankAdmin/employees/${id}`, data);

// --- Recovery / Installment actions ---
const assignInstallmentOfficer = (installmentId: string, employeeId: string) =>
  callAPi.put(`/api/v1/bankAdmin/installments/${installmentId}/assign-officer`, {
    employeeId,
  });

const markInstallmentDefaulter = (installmentId: string) =>
  callAPi.put(`/api/v1/bankAdmin/installments/${installmentId}/mark-defaulter`);

// --- Recovery cases (case-level operations) ---
const getRecoveryCases = (params?: any) =>
  callAPi.get('/api/v1/bankAdmin/installments/recovery-overview', { params });

const getRecoveryCaseById = (id: string) =>
  callAPi.get(`/api/v1/bankAdmin/recovery-cases/${id}`);

const updateRecoveryCaseStatus = (id: string, data: any) =>
  callAPi.put(`/api/v1/bankAdmin/recovery-cases/${id}/status`, data);

const assignRecoveryCase = (id: string, data: any) =>
  callAPi.put(`/api/v1/bankAdmin/recovery-cases/${id}/assign`, data);

const autoAssignRecoveryCases = () =>
  callAPi.post('/api/v1/bankAdmin/recovery-cases/auto-assign', {});

const bankAdminService = {
  login,
  forgotPassword,
  getBankSettings,
  updateBankSettings,
  resendOtp,
  verifyOtp,
  resetPassword,
  googleLogin,
  updateBank,
  createBorrower,
  getBorrowers,
  getBorrowerById,
  updateBorrower,
  deleteBorrower,
  getLoanApplications,
  getLoanApplicationById,
  updateLoanApplication,
  updateLoanApplicationStatus,
  deleteLoanApplication,
  getAssessments,
  getBankQuestions,
  createOrUpdateBankQuestions,
  toggleBankQuestionsStatus,
  addQuestion,
  updateQuestion,
  removeQuestion,
  getBankQuestionsForCustomer,
  createPaymentLedger,
  getPaymentLedgers,
  getPaymentLedgerById,
  updatePaymentLedger,
  deletePaymentLedger,
  getAllPayments,
  createRecoveryOverdue,
  getRecoveryOverdues,
  getRecoveryOverdueById,
  updateRecoveryOverdue,
  deleteRecoveryOverdue,
  getInstallmentsByCustomerId,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createSubscription,
  getCustomerLoanApplications,
  getDueInstallment,
  payInstallment,
  getInstallmentHistory,
  getRecoveryOverview,
  getStats,
  getAdditionalStats,
  getGraphsData,
  getCreditRatingOverview,
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  assignInstallmentOfficer,
  markInstallmentDefaulter,
  getRecoveryCases,
  getRecoveryCaseById,
  updateRecoveryCaseStatus,
  assignRecoveryCase,
  autoAssignRecoveryCases,
};

export default bankAdminService;

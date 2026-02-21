import { callAPi } from './http-common';

/**
 * Bank Admin Service
 * Handles API calls for Bank Admin role: auth, banks, borrowers, loan-applications,
 * assessments, bank-questions, payment-ledgers, recovery-overdues, installments, subscriptions.
 * Endpoints: /api/v1/bankAdmin/*
 */

// --- Bank Auth (public) ---
const login = (data: any) => callAPi.post('/api/v1/bankAdmin/banks/login', data);
const forgotPassword = (data: any) => callAPi.post('/api/v1/bankAdmin/banks/forgot-password', data);
const resendOtp = (data: any) => callAPi.post('/api/v1/bankAdmin/banks/resend-otp', data);
const verifyOtp = (data: any) => callAPi.post('/api/v1/bankAdmin/banks/verify-otp', data);
const resetPassword = (data: any) => callAPi.post('/api/v1/bankAdmin/banks/reset-password', data);
const googleLogin = (data: any) => callAPi.post('/api/v1/bankAdmin/banks/google-login', data);

// --- Bank (update) ---
const updateBank = (id: string, data: any) => callAPi.put(`/api/v1/bankAdmin/banks/${id}`, data);

// --- Borrowers ---
const createBorrower = (data: any) => callAPi.post('/api/v1/bankAdmin/borrowers', data);
const getBorrowers = (params?: any) => callAPi.get('/api/v1/bankAdmin/borrowers', { params });
const getBorrowerById = (id: string) => callAPi.get(`/api/v1/bankAdmin/borrowers/${id}`);
const updateBorrower = (id: string, data: any) => callAPi.put(`/api/v1/bankAdmin/borrowers/${id}`, data);
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

// --- Assessments ---
const getAssessments = (params?: any) => callAPi.get('/api/v1/bankAdmin/assessments', { params });

// --- Bank Questions ---
const getBankQuestions = () => callAPi.get('/api/v1/bankAdmin/bank-questions');
const createOrUpdateBankQuestions = (data: any) =>
  callAPi.post('/api/v1/bankAdmin/bank-questions', data);
const toggleBankQuestionsStatus = (data: any) =>
  callAPi.put('/api/v1/bankAdmin/bank-questions/toggle-status', data);
const addQuestion = (data: any) => callAPi.post('/api/v1/bankAdmin/bank-questions/add-question', data);
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
const getPaymentLedgerById = (id: string) =>
  callAPi.get(`/api/v1/bankAdmin/payment-ledgers/${id}`);
const updatePaymentLedger = (id: string, data: any) =>
  callAPi.put(`/api/v1/bankAdmin/payment-ledgers/${id}`, data);
const deletePaymentLedger = (id: string) =>
  callAPi.delete(`/api/v1/bankAdmin/payment-ledgers/${id}`);

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

// --- Subscriptions (create - Bank Token) ---
const createSubscription = (data: any) => callAPi.post('/api/v1/subscriptions', data);

const bankAdminService = {
  login,
  forgotPassword,
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
  createRecoveryOverdue,
  getRecoveryOverdues,
  getRecoveryOverdueById,
  updateRecoveryOverdue,
  deleteRecoveryOverdue,
  getInstallmentsByCustomerId,
  createSubscription,
};

export default bankAdminService;

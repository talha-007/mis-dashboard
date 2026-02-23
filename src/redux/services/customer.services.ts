import { callAPi } from './http-common';

/**
 * Customer Service
 * Handles API calls for Customer auth and profile.
 * Endpoints: /api/customers/*
 */

const register = (data: any) => callAPi.post('/api/customers/register', data);

const login = (data: any) => callAPi.post('/api/customers/login', data);

// Unified auth endpoints (work for both customers and bank admins)
const forgotPassword = (data: any) => callAPi.post('/api/auth/forgot-password', data);

const resendOtp = (data: any) => callAPi.post('/api/customers/resend-otp', data);

const verifyOtp = (data: any) => callAPi.post('/api/auth/verify-otp', data);

const resetPassword = (data: any) => callAPi.post('/api/auth/reset-password', data);

const googleLogin = (data: any) => callAPi.post('/api/customers/google-login', data);

const updateProfile = (id: string, data: any) => callAPi.put(`/api/customers/${id}`, data);

const getBankQuestionsForCustomer = (slug: string) =>
  callAPi.get(`/api/v1/bank-questions/customer/${slug}`);

const submitAssessmentAnswers = (data: any) => callAPi.post('/api/v1/assessments/submit', data);

// --- Stats ---
const getStats = () => callAPi.get('/api/v1/stats/customer');

const customerService = {
  register,
  login,
  forgotPassword,
  resendOtp,
  verifyOtp,
  resetPassword,
  googleLogin,
  updateProfile,
  getBankQuestionsForCustomer,
  submitAssessmentAnswers,
  getStats,
};

export default customerService;

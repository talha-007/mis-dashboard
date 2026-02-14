import { callAPi } from './http-common';

// Super Admin Login
const superAdminLogin = (data: any) => callAPi.post('/api/users/superadmin-login', data);

// Admin Login
const adminLogin = (data: any) => callAPi.post(`/api/banks/login`, data);

const forgotPasswordAdmin = (data: any) => callAPi.post(`/api/banks/forgot-password`, data);

const verifyEmailAdmin = (data: any) => callAPi.post(`/api/banks/verify-otp`, data);

const resendOTPAdmin = (data: any) => callAPi.post(`/api/banks/resend-otp`, data);

const newPasswordAdmin = (data: any) => callAPi.post(`/api/banks/reset-password`, data);

// User Login
const register = (data: any) => callAPi.post(`/api/customers/register`, data);

const userLogin = (data: any) => callAPi.post(`/api/customers/login`, data);

const forgotPassword = (data: any) => callAPi.post(`/api/customers/forgot-password`, data);

const resetPassword = (data: any) => callAPi.post(`/api/customers/reset-password`, data);

const resendOTP = (data: any) => callAPi.post(`/api/customers/resend-otp`, data);

const verifyOTP = (data: any) => callAPi.post(`/api/customers/verify-otp`, data);

const logout = (data: any) => callAPi.post(`/api/customers/logout`, data);

/** Current user by token - called after any login; returns id, name, email, role, subscriptionStatus */
const getMe = () => callAPi.get('/api/users/me');

const getCurrentUser = (data: any) => callAPi.get(`/api/customers/me`, data);

const updateProfile = (data: any) => callAPi.put(`/api/customers/${data.id}`, data);

const googleLogin = (data: any) => callAPi.post(`/api/customers/google-login`, data);

const requestPasswordReset = (data: any) =>
  callAPi.post(`/api/customers/request-password-reset`, data);

const verifyEmail = (data: any) => callAPi.post(`/api/customers/verify-email`, data);

const authService = {
  getMe,
  superAdminLogin,
  adminLogin,
  userLogin,
  register,
  logout,
  getCurrentUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
  resendOTP,
  updateProfile,
  googleLogin,
  requestPasswordReset,
  verifyEmail,
  forgotPasswordAdmin,
  verifyEmailAdmin,
  resendOTPAdmin,
  newPasswordAdmin,
};

export default authService;

import { callAPi } from './http-common';

/**
 * Customer Service
 * Handles API calls for Customer auth and profile.
 * Endpoints: /api/customers/*
 */

const register = (data: any) => callAPi.post('/api/customers/register', data);

const login = (data: any) => callAPi.post('/api/customers/login', data);

const forgotPassword = (data: any) => callAPi.post('/api/customers/forgot-password', data);

const resendOtp = (data: any) => callAPi.post('/api/customers/resend-otp', data);

const verifyOtp = (data: any) => callAPi.post('/api/customers/verify-otp', data);

const resetPassword = (data: any) => callAPi.post('/api/customers/reset-password', data);

const googleLogin = (data: any) => callAPi.post('/api/customers/google-login', data);

const updateProfile = (id: string, data: any) => callAPi.put(`/api/customers/${id}`, data);

const customerService = {
  register,
  login,
  forgotPassword,
  resendOtp,
  verifyOtp,
  resetPassword,
  googleLogin,
  updateProfile,
};

export default customerService;

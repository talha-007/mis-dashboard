import { callAPi } from "./http-common";

// Super Admin Login
const superAdminLogin = (data: any) => callAPi.post("/api/users/superadmin-login", data);

// Admin Login
const adminLogin = (data: any) => callAPi.post(`/api/v1/adminLogin`, data);

// User Login
const register = (data: any) => callAPi.post(`/api/customers/register`, data);

const userLogin = (data: any) => callAPi.post(`/api/customers/login`, data);

const forgotPassword = (data: any) => callAPi.post(`/api/customers/forgot-password`, data);

const resetPassword = (data: any) => callAPi.post(`/api/customers/reset-password`, data);

const resendOTP = (data: any) => callAPi.post(`/api/customers/resend-otp`, data);

const verifyOTP = (data: any) => callAPi.post(`/api/customers/verify-otp`, data);

const logout = (data: any) => callAPi.post(`/api/customers/logout`, data);

const getCurrentUser = (data: any) => callAPi.get(`/api/customers/me`, data);

const updateProfile=(data: any) => callAPi.put(`/api/customers/${data.id}`, data);

const googleLogin = (data: any) => callAPi.post(`/api/customers/google-login`, data);

const authService = {
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
  googleLogin
};

export default authService;
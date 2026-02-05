import { callAPi } from "./http-common";

const superAdminLogin = (data: any) => callAPi.post("/api/users/superadmin-login", data);

const adminLogin = (data: any) => callAPi.post(`/api/v1/adminLogin`, data);

const userLogin = (data: any) => callAPi.post(`/api/v1/userLogin`, data);

const register = (data: any) => callAPi.post(`/api/v1/register`, data);

const logout = (data: any) => callAPi.post(`/api/v1/logout`, data);

const getCurrentUser = (data: any) => callAPi.get(`/api/v1/getCurrentUser`, data);

const forgotPassword = (data: any) => callAPi.post(`/api/v1/forgotPassword`, data);
const requestPasswordReset = forgotPassword; // Alias for compatibility

const verifyOTP = (data: any) => callAPi.post(`/api/v1/verifyOTP`, data);
const verifyEmail = verifyOTP; // Alias for compatibility

const resetPassword = (data: any) => callAPi.post(`/api/v1/resetPassword`, data);

const authService = {
  superAdminLogin,
  adminLogin,
  userLogin,
  register,
  logout,
  getCurrentUser,
  forgotPassword,
  requestPasswordReset, // Alias for forgotPassword
  verifyOTP,
  verifyEmail, // Alias for verifyOTP
  resetPassword,
};

export default authService;
import type { MeUser, MeProfileResponse } from 'src/types/me.types';

import commonService from './common.services';
import customerService from './customer.services';
import bankAdminService from './bank-admin.services';
import superadminService from './superadmin.services';

/**
 * Auth Service (facade)
 * Delegates to role-specific services: superadmin, bank-admin, customer.
 * Keeps same API for existing auth flows.
 */

const superAdminLogin = (data: any) => superadminService.login(data);

const adminLogin = (data: any) => bankAdminService.login(data);

const forgotPasswordAdmin = (data: any) => bankAdminService.forgotPassword(data);

const verifyEmailAdmin = (data: any) => bankAdminService.verifyOtp(data);

const resendOTPAdmin = (data: any) => bankAdminService.resendOtp(data);

const newPasswordAdmin = (data: any) => bankAdminService.resetPassword(data);

const register = (data: any) => customerService.register(data);

const userLogin = (data: any) => customerService.login(data);

const forgotPassword = (data: any) => customerService.forgotPassword(data);

const resetPassword = (data: any) => customerService.resetPassword(data);

const resendOTP = (data: any) => customerService.resendOtp(data);

const verifyOTP = (data: any) => customerService.verifyOtp(data);

const googleLogin = (data: any) => customerService.googleLogin(data);

const getMe = () => commonService.getMe();

async function getProfile(): Promise<MeProfileResponse | null> {
  try {
    const response = await getMe();
    const data = response.data?.data ?? response.data;
    if (!data) return null;
    const user = (data.user ?? data) as MeUser;
    return {
      user,
      bank: data.bank ?? null,
      subscription: data.subscription ?? null,
    };
  } catch {
    return null;
  }
}

const updateProfile = (data: any) => customerService.updateProfile(data.id, data);

const logout = (data: any) => Promise.resolve({ data }); // client-side clear; backend may have /logout

const requestPasswordReset = (data: any) => customerService.forgotPassword(data);

const verifyEmail = (data: any) => customerService.verifyOtp(data);

const getCurrentUser = () => getMe();

const authService = {
  getMe,
  getProfile,
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

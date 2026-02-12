/**
 * Bank-Specific Authentication Service
 * Handles dynamic bank-based registration and login with bank_slug parameter
 * 
 * Usage:
 * - Customer Registration: POST /api/borrowers/register?bank_slug={bank_slug}
 * - Customer Login: POST /api/borrowers/login?bank_slug={bank_slug}
 * - Admin Login: POST /api/banks/{bank_slug}/login
 */

import { callAPi } from './http-common';

interface BankAuthData {
  bankSlug: string;
}

interface CustomerLoginData extends BankAuthData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface CustomerRegisterData extends BankAuthData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

interface AdminLoginData extends BankAuthData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Customer Registration with Bank Slug
 * POST /api/borrowers/register?bank_slug={bank_slug}
 */
const customerRegister = (data: CustomerRegisterData) => {
  const { bankSlug, ...payload } = data;
  return callAPi.post('/api/borrowers/register', payload, {
    params: { bank_slug: bankSlug },
  });
};

/**
 * Customer Login with Bank Slug
 * POST /api/borrowers/login?bank_slug={bank_slug}
 */
const customerLogin = (data: CustomerLoginData) => {
  const { bankSlug, ...payload } = data;
  return callAPi.post('/api/borrowers/login', payload, {
    params: { bank_slug: bankSlug },
  });
};

/**
 * Admin Login with Bank Slug
 * POST /api/banks/{bank_slug}/login
 */
const adminLogin = (data: AdminLoginData) => {
  const { bankSlug, ...payload } = data;
  return callAPi.post(`/api/banks/${bankSlug}/login`, payload);
};

/**
 * Customer Forgot Password with Bank Slug
 * POST /api/borrowers/forgot-password?bank_slug={bank_slug}
 */
const customerForgotPassword = (data: BankAuthData & { email: string }) => {
  const { bankSlug, email } = data;
  return callAPi.post('/api/borrowers/forgot-password', { email }, {
    params: { bank_slug: bankSlug },
  });
};

/**
 * Customer Verify OTP with Bank Slug
 * POST /api/borrowers/verify-otp?bank_slug={bank_slug}
 */
const customerVerifyOTP = (data: BankAuthData & { email: string; otp: string }) => {
  const { bankSlug, ...payload } = data;
  return callAPi.post('/api/borrowers/verify-otp', payload, {
    params: { bank_slug: bankSlug },
  });
};

/**
 * Admin Forgot Password with Bank Slug
 * POST /api/banks/{bank_slug}/forgot-password
 */
const adminForgotPassword = (data: BankAuthData & { email: string }) => {
  const { bankSlug, email } = data;
  return callAPi.post(`/api/banks/${bankSlug}/forgot-password`, { email });
};

/**
 * Admin Verify OTP with Bank Slug
 * POST /api/banks/{bank_slug}/verify-otp
 */
const adminVerifyOTP = (data: BankAuthData & { email: string; otp: string }) => {
  const { bankSlug, ...payload } = data;
  return callAPi.post(`/api/banks/${bankSlug}/verify-otp`, payload);
};

/**
 * Admin Reset Password with Bank Slug
 * POST /api/banks/{bank_slug}/reset-password
 */
const adminResetPassword = (data: BankAuthData & { email: string; password: string; otp: string }) => {
  const { bankSlug, ...payload } = data;
  return callAPi.post(`/api/banks/${bankSlug}/reset-password`, payload);
};

const bankAuthService = {
  customerRegister,
  customerLogin,
  adminLogin,
  customerForgotPassword,
  customerVerifyOTP,
  adminForgotPassword,
  adminVerifyOTP,
  adminResetPassword,
};

export default bankAuthService;

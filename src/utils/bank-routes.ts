/**
 * Bank-Based Route Navigation Helpers
 * Generates bank-specific URLs for dynamic routing
 * 
 * Examples:
 * - /acme-bank/register
 * - /acme-bank/login
 * - /acme-bank/admin/login
 * - /acme-bank/forgot-password
 */

/**
 * Generate customer registration URL for a bank
 */
export const getBankRegisterUrl = (bankSlug: string): string => {
  return `/${bankSlug}/register`;
};

/**
 * Generate customer login URL for a bank
 */
export const getBankLoginUrl = (bankSlug: string): string => {
  return `/${bankSlug}/login`;
};

/**
 * Generate admin login URL for a bank
 */
export const getBankAdminLoginUrl = (bankSlug: string): string => {
  return `/${bankSlug}/admin/login`;
};

/**
 * Generate customer forgot password URL for a bank
 */
export const getBankForgotPasswordUrl = (bankSlug: string): string => {
  return `/${bankSlug}/forgot-password`;
};

/**
 * Generate customer verify OTP URL for a bank
 */
export const getBankVerifyOtpUrl = (bankSlug: string): string => {
  return `/${bankSlug}/verify-otp`;
};

/**
 * Generate admin forgot password URL for a bank
 */
export const getBankAdminForgotPasswordUrl = (bankSlug: string): string => {
  return `/${bankSlug}/admin/forgot-password`;
};

/**
 * Generate admin verify OTP URL for a bank
 */
export const getBankAdminVerifyOtpUrl = (bankSlug: string): string => {
  return `/${bankSlug}/admin/verify-otp`;
};

/**
 * Generate admin new password URL for a bank
 */
export const getBankAdminNewPasswordUrl = (bankSlug: string): string => {
  return `/${bankSlug}/admin/new-password`;
};

/**
 * All bank route builders
 */
export const bankRoutes = {
  register: getBankRegisterUrl,
  login: getBankLoginUrl,
  adminLogin: getBankAdminLoginUrl,
  forgotPassword: getBankForgotPasswordUrl,
  verifyOtp: getBankVerifyOtpUrl,
  adminForgotPassword: getBankAdminForgotPasswordUrl,
  adminVerifyOtp: getBankAdminVerifyOtpUrl,
  adminNewPassword: getBankAdminNewPasswordUrl,
};

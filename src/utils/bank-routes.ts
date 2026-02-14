/**
 * Bank-Based Route Navigation Helpers
 * Only registration uses bank slug (/:bank_slug/register). All other auth routes are global.
 */

/**
 * Customer registration URL – only route that uses bank slug
 */
export const getBankRegisterUrl = (bankSlug: string): string => `/${bankSlug}/register`;

/**
 * Customer sign-in (no bank slug)
 */
export const getBankLoginUrl = (_bankSlug?: string): string => '/sign-in';

/**
 * Bank admin sign-in (no bank slug)
 */
export const getBankAdminLoginUrl = (_bankSlug?: string): string => '/sign-in/admin';

/**
 * Customer forgot password (no bank slug)
 */
export const getBankForgotPasswordUrl = (_bankSlug?: string): string => '/forgot-password';

/**
 * Customer verify OTP (no bank slug)
 */
export const getBankVerifyOtpUrl = (_bankSlug?: string): string => '/verify-otp';

/**
 * Admin forgot password (no bank slug)
 */
export const getBankAdminForgotPasswordUrl = (_bankSlug?: string): string =>
  '/admin/forgot-password';

/**
 * Admin verify OTP (no bank slug)
 */
export const getBankAdminVerifyOtpUrl = (_bankSlug?: string): string => '/admin/verify-otp';

/**
 * Admin new password (no bank slug)
 */
export const getBankAdminNewPasswordUrl = (_bankSlug?: string): string => '/admin/new-password';

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

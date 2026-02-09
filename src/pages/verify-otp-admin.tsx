/**
 * Verify OTP Page
 * OTP verification for registration and password reset
 */

import { Helmet } from 'react-helmet-async';

import { VerifyOtpAdminView } from 'src/sections/auth/verify-otp-admin';

export default function VerifyOtpAdminPage() {
  return (
    <>
      <Helmet>
        <title>Verify OTP Admin - MIS Dashboard</title>
      </Helmet>

      <VerifyOtpAdminView />
    </>
  );
}

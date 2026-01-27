/**
 * Verify OTP Page
 * OTP verification for registration and password reset
 */

import { Helmet } from 'react-helmet-async';

import { VerifyOtpView } from 'src/sections/auth/verify-otp-view';

export default function VerifyOtpPage() {
  return (
    <>
      <Helmet>
        <title>Verify OTP - MIS Dashboard</title>
      </Helmet>

      <VerifyOtpView />
    </>
  );
}

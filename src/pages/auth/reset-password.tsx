/**
 * Reset Password Page
 * Reset password page for customer users
 */

import { Helmet } from 'react-helmet-async';

import { ResetPasswordView } from 'src/sections/auth/reset-password-view';

export default function ResetPasswordPage() {
  return (
    <>
      <Helmet>
        <title>Reset Password - MIS Dashboard</title>
      </Helmet>

      <ResetPasswordView />
    </>
  );
}

/**
 * Forgot Password Page
 * Password reset request page
 */

import { Helmet } from 'react-helmet-async';

import { ForgotPasswordAdminView } from 'src/sections/auth/forgot-password-admin-view';

export default function ForgotPasswordAdminPage() {
  return (
    <>
      <Helmet>
        <title>Forgot Password Admin - MIS Dashboard</title>
      </Helmet>

      <ForgotPasswordAdminView />
    </>
  );
}

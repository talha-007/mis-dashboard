/**
 * New Password Admin Page
 * Reset password page for admin users
 */

import { Helmet } from 'react-helmet-async';

import { NewPasswordAdminView } from 'src/sections/auth/new-password-admin-view';

export default function NewPasswordAdminPage() {
  return (
    <>
      <Helmet>
        <title>Reset Password Admin - MIS Dashboard</title>
      </Helmet>

      <NewPasswordAdminView />
    </>
  );
}

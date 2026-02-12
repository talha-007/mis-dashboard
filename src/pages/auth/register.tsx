/**
 * Registration Page
 * Customer registration for microfinance bank
 */

import { Helmet } from 'react-helmet-async';

import { RegisterView } from 'src/sections/auth/register-view';

export default function RegisterPage() {
  return (
    <>
      <Helmet>
        <title>Register - MIS Dashboard</title>
      </Helmet>

      <RegisterView />
    </>
  );
}

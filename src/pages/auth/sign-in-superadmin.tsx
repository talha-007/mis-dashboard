import { CONFIG } from 'src/config-global';

import { SignInSuperAdminView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Super Admin Sign In - ${CONFIG.appName}`}</title>

      <SignInSuperAdminView />
    </>
  );
}

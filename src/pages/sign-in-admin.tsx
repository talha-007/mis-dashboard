import { CONFIG } from 'src/config-global';

import { SignInAdminView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Admin Sign In - ${CONFIG.appName}`}</title>

      <SignInAdminView />
    </>
  );
}

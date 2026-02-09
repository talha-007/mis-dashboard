import { CONFIG } from 'src/config-global';

import { SignInRoleSelectorView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Sign in - ${CONFIG.appName}`}</title>

      <SignInRoleSelectorView />
    </>
  );
}

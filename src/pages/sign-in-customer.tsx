import { CONFIG } from 'src/config-global';

import { SignInCustomerView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Customer Sign In - ${CONFIG.appName}`}</title>

      <SignInCustomerView />
    </>
  );
}

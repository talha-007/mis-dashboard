import { CONFIG } from 'src/config-global';

import { ProfileView } from 'src/sections/customer/profile';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Profile - ${CONFIG.appName}`}</title>
      <meta name="description" content="Update your profile information" />

      <ProfileView />
    </>
  );
}

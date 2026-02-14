import { CONFIG } from 'src/config-global';

import { ProfileMeView } from 'src/sections/profile';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Profile - ${CONFIG.appName}`}</title>
      <meta name="description" content="Your profile and account details" />

      <ProfileMeView />
    </>
  );
}

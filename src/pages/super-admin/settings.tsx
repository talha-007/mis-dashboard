import { CONFIG } from 'src/config-global';

import { SettingsView } from 'src/sections/Superadmin/settings';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`System Settings - ${CONFIG.appName}`}</title>
      <meta name="description" content="Manage system settings and bank access controls" />

      <SettingsView />
    </>
  );
}

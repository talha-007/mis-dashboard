import { CONFIG } from 'src/config-global';

import { BankSettingsView } from 'src/sections/Bankadmin/settings';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Bank Settings - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="Configure insurance rate and interest rate for your bank"
      />

      <BankSettingsView />
    </>
  );
}

import { CONFIG } from 'src/config-global';

import { BankView } from 'src/sections/Superadmin/bank/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Bank Management - ${CONFIG.appName}`}</title>
      <meta name="description" content="Manage banks and their operations" />
      <meta name="keywords" content="bank,management,admin,microfinance" />

      <BankView />
    </>
  );
}

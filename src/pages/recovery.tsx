import { CONFIG } from 'src/config-global';

import { RecoveryView } from 'src/sections/recovery/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Recoveries & Overdues - ${CONFIG.appName}`}</title>
      <meta name="description" content="Track overdue loans and recoveries" />
      <meta name="keywords" content="recovery,overdue,defaulter,microfinance" />

      <RecoveryView />
    </>
  );
}

import { CONFIG } from 'src/config-global';

import { InstallmentsView } from 'src/sections/customer/installments';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`My Installments - ${CONFIG.appName}`}</title>
      <meta name="description" content="View your loan installment schedule" />

      <InstallmentsView />
    </>
  );
}

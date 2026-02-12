import { CONFIG } from 'src/config-global';

import { BankPaymentsView } from 'src/sections/bank/payments';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Bank Subscription Management - ${CONFIG.appName}`}</title>
      <meta name="description" content="Manage bank subscriptions and payments" />
      <meta name="keywords" content="bank,subscription,payment,management" />

      <BankPaymentsView />
    </>
  );
}

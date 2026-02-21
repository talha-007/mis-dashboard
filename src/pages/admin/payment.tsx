import { CONFIG } from 'src/config-global';

import { PaymentView } from 'src/sections/Bankadmin/payment/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Payments & Ledger - ${CONFIG.appName}`}</title>
      <meta name="description" content="Track all payment transactions and ledger" />
      <meta name="keywords" content="payment,ledger,transaction,microfinance" />

      <PaymentView />
    </>
  );
}

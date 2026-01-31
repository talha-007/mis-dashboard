import { CONFIG } from 'src/config-global';

import { PayInstallmentView } from 'src/sections/customer/pay-installment';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Pay Installment - ${CONFIG.appName}`}</title>
      <meta name="description" content="Make a payment for your installment" />

      <PayInstallmentView />
    </>
  );
}

import { CONFIG } from 'src/config-global';

import { PayoffOfferView } from 'src/sections/customer/payoff-offer';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Payoff Offer - ${CONFIG.appName}`}</title>
      <meta name="description" content="View early payoff options and offers" />

      <PayoffOfferView />
    </>
  );
}

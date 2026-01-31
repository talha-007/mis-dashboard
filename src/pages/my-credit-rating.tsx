import { CONFIG } from 'src/config-global';

import { CustomerCreditRatingView } from 'src/sections/customer/credit-rating';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`My Credit Rating - ${CONFIG.appName}`}</title>
      <meta name="description" content="View your credit rating and score" />

      <CustomerCreditRatingView />
    </>
  );
}

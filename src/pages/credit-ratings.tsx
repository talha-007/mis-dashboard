import { CONFIG } from 'src/config-global';

import { CreditRatingView } from 'src/sections/credit-rating/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Credit Ratings - ${CONFIG.appName}`}</title>

      <meta
        name="description"
        content="View and manage credit ratings and risk assessments for all borrowers"
      />

      <CreditRatingView />
    </>
  );
}

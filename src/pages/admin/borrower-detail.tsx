import { CONFIG } from 'src/config-global';

import { BorrowerDetailView } from 'src/sections/Bankadmin/borrower/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Borrower Details - ${CONFIG.appName}`}</title>
      <meta name="description" content="View borrower details" />
      <meta name="keywords" content="borrower,details,microfinance" />

      <BorrowerDetailView />
    </>
  );
}

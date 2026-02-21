import { CONFIG } from 'src/config-global';

import { BorrowerView } from 'src/sections/Bankadmin/borrower/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Borrower Management - ${CONFIG.appName}`}</title>
      <meta name="description" content="Manage borrowers and loan applications" />
      <meta name="keywords" content="borrower,loan,management,microfinance" />

      <BorrowerView />
    </>
  );
}

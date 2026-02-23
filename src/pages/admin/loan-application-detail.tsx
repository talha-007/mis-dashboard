import { CONFIG } from 'src/config-global';

import { LoanApplicationDetailView } from 'src/sections/Bankadmin/loan-application/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Loan Application Details - ${CONFIG.appName}`}</title>
      <meta name="description" content="View loan application details" />
      <meta name="keywords" content="loan,application,details,microfinance" />

      <LoanApplicationDetailView />
    </>
  );
}

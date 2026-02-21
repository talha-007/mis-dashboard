import { CONFIG } from 'src/config-global';

import { LoanApplicationView } from 'src/sections/Bankadmin/loan-application/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Loan Applications - ${CONFIG.appName}`}</title>
      <meta name="description" content="Review and approve loan applications" />
      <meta name="keywords" content="loan,application,approval,microfinance" />

      <LoanApplicationView />
    </>
  );
}

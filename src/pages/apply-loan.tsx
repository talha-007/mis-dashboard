import { CONFIG } from 'src/config-global';

import { ApplyLoanView } from 'src/sections/customer/apply-loan';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Apply for Loan - ${CONFIG.appName}`}</title>
      <meta name="description" content="Apply for a new loan" />

      <ApplyLoanView />
    </>
  );
}

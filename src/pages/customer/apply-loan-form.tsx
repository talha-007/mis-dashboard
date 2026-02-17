import { CONFIG } from 'src/config-global';

import { ApplyLoanFlowView } from 'src/sections/customer/apply-loan/apply-loan-flow-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Loan Application - ${CONFIG.appName}`}</title>
      <meta name="description" content="Start a new loan application" />

      <ApplyLoanFlowView />
    </>
  );
}


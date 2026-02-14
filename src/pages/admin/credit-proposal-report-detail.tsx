import { CONFIG } from 'src/config-global';

import { CreditProposalReportDetailView } from 'src/sections/credit-proposal-report/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Credit Proposal Report - ${CONFIG.appName}`}</title>
      <meta name="description" content="Credit proposal report detail and loan decision" />
      <CreditProposalReportDetailView />
    </>
  );
}

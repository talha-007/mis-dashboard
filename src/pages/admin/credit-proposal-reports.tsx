import { CONFIG } from 'src/config-global';

import { CreditProposalReportListView } from 'src/sections/Bankadmin/credit-proposal-report/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Credit Proposal Reports - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="View and approve or reject loan applications with credit assessment reports"
      />
      <CreditProposalReportListView />
    </>
  );
}

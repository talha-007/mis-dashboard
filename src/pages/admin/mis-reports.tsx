import { CONFIG } from 'src/config-global';

import { ReportView } from 'src/sections/Bankadmin/report/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`MIS & Reports - ${CONFIG.appName}`}</title>

      <meta
        name="description"
        content="View and generate MIS and regulatory reports including portfolio, recovery, credit, and compliance reports"
      />

      <ReportView />
    </>
  );
}

import { CONFIG } from 'src/config-global';

import { CustomerAssessmentView } from 'src/sections/customer/assessment';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Credit Assessment - ${CONFIG.appName}`}</title>
      <meta name="description" content="Complete the credit assessment to apply for a loan" />
      <CustomerAssessmentView />
    </>
  );
}

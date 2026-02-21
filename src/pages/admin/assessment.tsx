import { CONFIG } from 'src/config-global';

import { AssessmentView } from 'src/sections/Bankadmin/assessment/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Assessment - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="Set up credit assessment questions and option points for your bank"
      />
      <AssessmentView />
    </>
  );
}

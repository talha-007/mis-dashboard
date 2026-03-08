import { Helmet } from 'react-helmet-async';

import { RecoveryOfficerDashboardView } from 'src/sections/Employee/recovery/my-cases-view';

export default function RecoveryDashboardPage() {
  return (
    <>
      <Helmet>
        <title> Recovery Dashboard | MIS Dashboard </title>
      </Helmet>
      <RecoveryOfficerDashboardView />
    </>
  );
}

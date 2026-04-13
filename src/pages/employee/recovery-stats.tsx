import { Helmet } from 'react-helmet-async';

import { RecoveryStatsView } from 'src/sections/Employee/recovery/recovery-stats-view';

export default function RecoveryStatsPage() {
  return (
    <>
      <Helmet>
        <title> Recovery stats | MIS Dashboard </title>
      </Helmet>
      <RecoveryStatsView />
    </>
  );
}

import { CONFIG } from 'src/config-global';

import { UsersView } from 'src/sections/users/view';

export default function Page() {
  return (
    <>
      <title>{`Users Management - ${CONFIG.appName}`}</title>
      <UsersView />
    </>
  );
}

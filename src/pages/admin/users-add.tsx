import { CONFIG } from 'src/config-global';

import { UsersFormView } from 'src/sections/users/users-form-view';

export default function Page() {
  return (
    <>
      <title>{`Add User - ${CONFIG.appName}`}</title>
      <UsersFormView />
    </>
  );
}

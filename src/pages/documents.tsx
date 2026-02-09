import { CONFIG } from 'src/config-global';

import { DocumentsView } from 'src/sections/customer/documents';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Documents - ${CONFIG.appName}`}</title>
      <meta name="description" content="Upload and manage your documents" />

      <DocumentsView />
    </>
  );
}

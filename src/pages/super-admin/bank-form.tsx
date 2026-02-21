import { useSearchParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { BankFormView } from 'src/sections/Superadmin/bank/form';

// ----------------------------------------------------------------------

export default function Page() {
  const [searchParams] = useSearchParams();
  const bankId = searchParams.get('id') || undefined;

  return (
    <>
      <title>{`${bankId ? 'Edit' : 'Register'} Bank - ${CONFIG.appName}`}</title>
      <meta name="description" content={bankId ? 'Edit bank information' : 'Register a new bank'} />
      <meta name="keywords" content="bank,registration,admin,microfinance" />

      <BankFormView bankId={bankId} />
    </>
  );
}

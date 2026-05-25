import { useState, useEffect, useCallback } from 'react';

import { useParams, useRouter } from 'src/routes/hooks';

import { getApiErrorMessage } from 'src/utils/api-error';

import { CONFIG } from 'src/config-global';
import bankService from 'src/redux/services/bank.services';

import {
  BankDetailsView,
  type BankDetailsResponse,
} from 'src/sections/Superadmin/bank/view/bank-details-view';

// ----------------------------------------------------------------------

export default function Page() {
  const router = useRouter();
  const { id } = useParams();
  const [bank, setBank] = useState<BankDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBank = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await bankService.getBankById(id);
      const data = response.data?.data ?? response.data ?? null;
      setBank(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load bank details'));
      setBank(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBank();
  }, [fetchBank]);

  const handleEdit = () => {
    if (id) router.push(`/bank-management/form?id=${id}`);
  };

  return (
    <>
      <title>{`Bank Details - ${CONFIG.appName}`}</title>
      <meta name="description" content="View bank details" />

      <BankDetailsView
        bank={bank}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onRetry={fetchBank}
      />
    </>
  );
}

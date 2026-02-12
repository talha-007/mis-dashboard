/**
 * Hook to extract bank_slug from URL and manage bank context
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export interface BankSlugContext {
  bankSlug: string | undefined;
  navigateToBankLogin: (path?: string) => void;
  navigateToBankRegister: () => void;
  navigateToBankAdminLogin: () => void;
}

/**
 * Hook to access bank_slug from URL parameters
 * @returns Object with bankSlug and navigation helpers
 */
export const useBankSlug = (): BankSlugContext => {
  const { bank_slug } = useParams<{ bank_slug: string }>();
  const navigate = useNavigate();

  const navigateToBankLogin = useCallback(
    (customPath?: string) => {
      if (bank_slug) {
        navigate(customPath || `/${bank_slug}/login`);
      }
    },
    [bank_slug, navigate]
  );

  const navigateToBankRegister = useCallback(() => {
    if (bank_slug) {
      navigate(`/${bank_slug}/register`);
    }
  }, [bank_slug, navigate]);

  const navigateToBankAdminLogin = useCallback(() => {
    if (bank_slug) {
      navigate(`/${bank_slug}/admin/login`);
    }
  }, [bank_slug, navigate]);

  return {
    bankSlug: bank_slug,
    navigateToBankLogin,
    navigateToBankRegister,
    navigateToBankAdminLogin,
  };
};

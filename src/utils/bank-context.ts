/**
 * Bank Context Utilities
 * Manages bank-specific state and configurations
 */

import { useCallback } from 'react';

import { useBankSlug } from 'src/hooks/use-bank-slug';

/**
 * Get bank-specific data from local storage
 */
export const getBankDataFromSlug = (bankSlug: string | undefined) => {
  if (!bankSlug) return null;

  try {
    // Store bank slug in session/context for API calls
    sessionStorage.setItem('current_bank_slug', bankSlug);
    return { bankSlug };
  } catch (error) {
    console.error('Error storing bank slug:', error);
    return null;
  }
};

/**
 * Clear bank-specific data
 */
export const clearBankData = () => {
  try {
    sessionStorage.removeItem('current_bank_slug');
  } catch (error) {
    console.error('Error clearing bank data:', error);
  }
};

/**
 * Get current bank slug from storage
 */
export const getCurrentBankSlug = (): string | null => {
  try {
    return sessionStorage.getItem('current_bank_slug');
  } catch (error) {
    console.error('Error retrieving bank slug:', error);
    return null;
  }
};

/**
 * Hook to initialize bank context and set bank slug
 */
export const useBankContext = () => {
  const { bankSlug } = useBankSlug();

  const initializeBankContext = useCallback(async () => {
    if (bankSlug) {
      getBankDataFromSlug(bankSlug);
    }
  }, [bankSlug]);

  const cleanupBankContext = useCallback(() => {
    clearBankData();
  }, []);

  return {
    bankSlug,
    initializeBankContext,
    cleanupBankContext,
    currentBankSlug: getCurrentBankSlug(),
  };
};

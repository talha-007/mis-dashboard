/**
 * useSearchParams Hook
 * Get URL search parameters
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function useSearchParams() {
  const location = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    
    return {
      get: (key: string) => params.get(key),
      getAll: (key: string) => params.getAll(key),
      has: (key: string) => params.has(key),
      toString: () => params.toString(),
      entries: () => params.entries(),
      keys: () => params.keys(),
      values: () => params.values(),
    };
  }, [location.search]);
}

'use client';
/**
 * React hook for ERP data fetching with SWR-style caching.
 *
 * Usage:
 *   const { data, error, isLoading, refresh } = useERP(() => finance.accounts());
 */
import { useState, useEffect, useCallback } from 'react';

interface UseERPResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useERP<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseERPResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, error, isLoading, refresh };
}

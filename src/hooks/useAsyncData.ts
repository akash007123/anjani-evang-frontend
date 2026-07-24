import { useState, useEffect, useRef } from 'react';

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  deps: any[] = []
): { data: T; loading: boolean; error: string | null } {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (!cancelledRef.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelledRef.current) {
          setError(err?.message || 'Failed to load data');
          setLoading(false);
        }
      });
    return () => {
      cancelledRef.current = true;
    };
  }, deps);

  return { data, loading, error };
}

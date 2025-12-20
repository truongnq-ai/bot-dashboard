/**
 * Grade Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { getGrades } from '@/lib/api/grade.service';

/**
 * Hook to fetch available grades list
 */
export function useGrades() {
  const [data, setData] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getGrades();
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch grades'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  return { data, loading, error, refetch: fetchGrades };
}


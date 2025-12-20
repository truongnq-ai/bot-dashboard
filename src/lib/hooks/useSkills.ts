/**
 * Skill Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { Skill, PageResponse } from '@/types/skill';
import { getSkills } from '@/lib/api/skill.service';

/**
 * Hook to fetch skills list
 */
export function useSkills() {
  const [data, setData] = useState<PageResponse<Skill> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSkills();
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch skills'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return { data, loading, error, refetch: fetchSkills };
}

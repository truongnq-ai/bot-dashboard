/**
 * Skill Hooks
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Skill, SkillSearchParams } from '@/types/skill';
import { PageResponse } from '@/types/common';
import { getSkills, getSkillById } from '@/lib/api/skill.service';

/**
 * Hook to fetch skills list with pagination
 */
export function useSkills(searchParams: SkillSearchParams = {}) {
  const [data, setData] = useState<PageResponse<Skill> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Store searchParams in ref to use in callback
  const searchParamsRef = useRef<SkillSearchParams>(searchParams);
  searchParamsRef.current = searchParams;
  
  // Serialize searchParams to string for stable comparison
  const searchParamsKey = useMemo(
    () => JSON.stringify(searchParams),
    [
      searchParams.page,
      searchParams.pageSize,
      searchParams.searchText,
      searchParams.grade,
      searchParams.chapterId,
      searchParams.sortBy,
      searchParams.sortDirection,
    ]
  );
  
  // Store previous key to detect changes
  const prevKeyRef = useRef<string>('');

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSkills(searchParamsRef.current);
      if (response.errorCode === '0000' && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch skills'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch skills'));
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we use ref

  useEffect(() => {
    // Only fetch if searchParams actually changed
    if (prevKeyRef.current !== searchParamsKey) {
      prevKeyRef.current = searchParamsKey;
      fetchSkills();
    }
  }, [searchParamsKey, fetchSkills]);

  return { data, loading, error, refetch: fetchSkills };
}

/**
 * Hook to fetch single skill by ID
 */
export function useSkill(id: string | null) {
  const [data, setData] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSkill = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getSkillById(id);
      if (response.errorCode === '0000' && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch skill'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch skill'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSkill();
  }, [fetchSkill]);

  return { data, loading, error, refetch: fetchSkill };
}

/**
 * Teacher Hooks
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Teacher, TeacherSearchParams } from '@/types/teacher';
import { PageResponse } from '@/types/common';
import { getTeachers, getTeacherById } from '@/lib/api/teacher.service';

/**
 * Hook to fetch teachers list with pagination
 */
export function useTeachers(searchParams: TeacherSearchParams = {}) {
  const [data, setData] = useState<PageResponse<Teacher> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Store searchParams in ref to use in callback
  const searchParamsRef = useRef<TeacherSearchParams>(searchParams);
  searchParamsRef.current = searchParams;
  
  // Serialize searchParams to string for stable comparison
  const searchParamsKey = useMemo(
    () => JSON.stringify(searchParams),
    [
      searchParams.page,
      searchParams.pageSize,
      searchParams.role,
      searchParams.username,
      searchParams.name,
    ]
  );
  
  // Store previous key to detect changes
  const prevKeyRef = useRef<string>('');

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTeachers(searchParamsRef.current);
      if (response.errorCode === '0000' && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch teachers'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch teachers'));
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we use ref

  useEffect(() => {
    // Only fetch if searchParams actually changed
    if (prevKeyRef.current !== searchParamsKey) {
      prevKeyRef.current = searchParamsKey;
      fetchTeachers();
    }
  }, [searchParamsKey, fetchTeachers]);

  return { data, loading, error, refetch: fetchTeachers };
}

/**
 * Hook to fetch single teacher by ID
 */
export function useTeacher(id: string | null) {
  const [data, setData] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeacher = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getTeacherById(id);
      if (response.errorCode === '0000' && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch teacher'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch teacher'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeacher();
  }, [fetchTeacher]);

  return { data, loading, error, refetch: fetchTeacher };
}


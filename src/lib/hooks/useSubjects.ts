/**
 * Subject Hooks
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Subject, SubjectSearchParams } from '@/types/subject';
import { getAllSubjects, getSubjectById } from '@/lib/api/subject.service';

/**
 * Hook to fetch all subjects with client-side filtering and pagination
 */
export function useSubjects(searchParams: SubjectSearchParams = {}) {
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all subjects when searchParams changes
  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllSubjects(searchParams.name);
      if (response.errorCode === '0000' && response.data) {
        setAllSubjects(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch subjects'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subjects'));
    } finally {
      setLoading(false);
    }
  }, [searchParams.name]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSubjects();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [fetchSubjects]);

  return {
    data: allSubjects,
    loading,
    error,
    refetch: fetchSubjects,
    totalElements: allSubjects.length,
  };
}

/**
 * Hook to fetch single subject by ID
 */
export function useSubject(id: string | null) {
  const [data, setData] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchSubject = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSubjectById(id);
        if (response.errorCode === '0000' && response.data) {
          setData(response.data);
        } else {
          setError(new Error(response.errorDetail || 'Failed to fetch subject'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch subject'));
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [id]);

  return { data, loading, error };
}


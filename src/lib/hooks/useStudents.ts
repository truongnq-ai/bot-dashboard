/**
 * Student Hooks
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Student, StudentSearchParams } from '@/types/student';
import { PageResponse } from '@/types/common';
import { getStudents, getStudentById } from '@/lib/api/student.service';

/**
 * Hook to fetch students list with pagination
 */
export function useStudents(searchParams: StudentSearchParams = {}) {
  const [data, setData] = useState<PageResponse<Student> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Store searchParams in ref to use in callback
  const searchParamsRef = useRef<StudentSearchParams>(searchParams);
  searchParamsRef.current = searchParams;
  
  // Serialize searchParams to string for stable comparison
  const searchParamsKey = useMemo(
    () => JSON.stringify(searchParams),
    [
      searchParams.page,
      searchParams.pageSize,
      searchParams.role,
    ]
  );
  
  // Store previous key to detect changes
  const prevKeyRef = useRef<string>('');

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStudents(searchParamsRef.current);
      if (response.errorCode === '0000' && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch students'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch students'));
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we use ref

  useEffect(() => {
    // Only fetch if searchParams actually changed
    if (prevKeyRef.current !== searchParamsKey) {
      prevKeyRef.current = searchParamsKey;
      fetchStudents();
    }
  }, [searchParamsKey, fetchStudents]);

  return { data, loading, error, refetch: fetchStudents };
}

/**
 * Hook to fetch single student by ID
 */
export function useStudent(id: string | null) {
  const [data, setData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStudent = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getStudentById(id);
      if (response.errorCode === '0000' && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch student'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch student'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  return { data, loading, error, refetch: fetchStudent };
}


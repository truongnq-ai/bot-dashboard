/**
 * Parent Hooks
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Parent, ParentSearchParams } from '@/types/parent';
import { PageResponse } from '@/types/common';
import { getParents, getParentById } from '@/lib/api/parent.service';

/**
 * Hook to fetch parents list with pagination
 */
export function useParents(searchParams: ParentSearchParams = {}) {
  const [data, setData] = useState<PageResponse<Parent> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Store searchParams in ref to use in callback
  const searchParamsRef = useRef<ParentSearchParams>(searchParams);
  searchParamsRef.current = searchParams;
  
  // Serialize searchParams to string for stable comparison
  const searchParamsKey = useMemo(
    () => JSON.stringify(searchParams),
    [
      searchParams.page,
      searchParams.pageSize,
      searchParams.searchText,
      searchParams.status,
      searchParams.phoneVerified,
      searchParams.sortBy,
      searchParams.sortDirection,
    ]
  );
  
  // Store previous key to detect changes
  const prevKeyRef = useRef<string>('');

  const fetchParents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getParents(searchParamsRef.current);
      if (response.errorCode === '0000' && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch parents'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch parents'));
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we use ref

  useEffect(() => {
    // Only fetch if searchParams actually changed
    if (prevKeyRef.current !== searchParamsKey) {
      prevKeyRef.current = searchParamsKey;
      fetchParents();
    }
  }, [searchParamsKey, fetchParents]);

  return { data, loading, error, refetch: fetchParents };
}

/**
 * Hook to fetch single parent by ID
 */
export function useParent(id: string | null) {
  const [data, setData] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchParent = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getParentById(id);
      if (response.errorCode === '0000' && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch parent'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch parent'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchParent();
  }, [fetchParent]);

  return { data, loading, error, refetch: fetchParent };
}


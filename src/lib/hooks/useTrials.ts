/**
 * Trial Hooks
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Trial, TrialSearchParams } from '@/types/trial';
import { PageResponse } from '@/types/common';
import { getTrials, getTrialById } from '@/lib/api/trial.service';

/**
 * Hook to fetch trials list with pagination
 */
export function useTrials(searchParams: TrialSearchParams = {}) {
  const [data, setData] = useState<PageResponse<Trial> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Store searchParams in ref to use in callback
  const searchParamsRef = useRef<TrialSearchParams>(searchParams);
  searchParamsRef.current = searchParams;
  
  // Serialize searchParams to string for stable comparison
  const searchParamsKey = useMemo(
    () => JSON.stringify(searchParams),
    [
      searchParams.page,
      searchParams.pageSize,
      searchParams.deviceId,
      searchParams.status,
      searchParams.anonymousId,
      searchParams.sortBy,
      searchParams.sortDirection,
    ]
  );
  
  // Store previous key to detect changes
  const prevKeyRef = useRef<string>('');

  const fetchTrials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTrials(searchParamsRef.current);
      if (response.errorCode === '0000' && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch trials'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch trials'));
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we use ref

  useEffect(() => {
    // Only fetch if searchParams actually changed
    if (prevKeyRef.current !== searchParamsKey) {
      prevKeyRef.current = searchParamsKey;
      fetchTrials();
    }
  }, [searchParamsKey, fetchTrials]);

  return { data, loading, error, refetch: fetchTrials };
}

/**
 * Hook to fetch single trial by ID
 */
export function useTrial(id: string | null) {
  const [data, setData] = useState<Trial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrial = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getTrialById(id);
      if (response.errorCode === '0000' && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch trial'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch trial'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTrial();
  }, [fetchTrial]);

  return { data, loading, error, refetch: fetchTrial };
}


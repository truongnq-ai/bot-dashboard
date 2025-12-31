/**
 * Chapter Hooks
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Chapter, ChapterSearchParams } from '@/types/chapter';
import { PageResponse } from '@/types/common';
import { getChapters, getChapterById } from '@/lib/api/chapter.service';

/**
 * Hook to fetch chapters list with pagination
 */
export function useChapters(searchParams: ChapterSearchParams = {}) {
  const [data, setData] = useState<PageResponse<Chapter> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Store searchParams in ref to use in callback
  const searchParamsRef = useRef<ChapterSearchParams>(searchParams);
  searchParamsRef.current = searchParams;
  
  // Serialize searchParams to string for stable comparison
  const searchParamsKey = useMemo(
    () => JSON.stringify(searchParams),
    [
      searchParams.page,
      searchParams.pageSize,
      searchParams.grade,
      searchParams.sortBy,
      searchParams.sortDirection,
    ]
  );
  
  // Store previous key to detect changes
  const prevKeyRef = useRef<string>('');

  const fetchChapters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getChapters(searchParamsRef.current);
      if (response.errorCode === '0000' && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch chapters'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch chapters'));
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we use ref

  useEffect(() => {
    // Only fetch if searchParams actually changed
    if (prevKeyRef.current !== searchParamsKey) {
      prevKeyRef.current = searchParamsKey;
      fetchChapters();
    }
  }, [searchParamsKey, fetchChapters]);

  return { data, loading, error, refetch: fetchChapters };
}

/**
 * Hook to fetch single chapter by ID
 */
export function useChapter(id: string | null) {
  const [data, setData] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchChapter = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getChapterById(id);
        if (response.errorCode === '0000' && response.data) {
          setData(response.data);
        } else {
          setError(new Error(response.errorDetail || 'Failed to fetch chapter'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch chapter'));
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [id]);

  return { data, loading, error };
}


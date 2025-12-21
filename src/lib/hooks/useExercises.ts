/**
 * Exercise Hooks
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Exercise,
  ExerciseSearchParams,
  ExerciseStatsResponse,
  ExerciseReviewLog,
} from '@/types/exercise';
import { PageResponse } from '@/types/common';
import {
  getExercises,
  getExerciseById,
  getExerciseStats,
  getReviewHistory,
} from '@/lib/api/exercise.service';

/**
 * Hook to fetch exercises list with pagination
 */
export function useExercises(searchParams: ExerciseSearchParams = {}) {
  const [data, setData] = useState<PageResponse<Exercise> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize searchParams to create a stable reference based on actual values
  const memoizedSearchParams = useMemo(
    () => ({ ...searchParams }),
    [
      searchParams.skillId,
      searchParams.grade,
      searchParams.reviewStatus,
      searchParams.difficultyLevel,
      searchParams.searchText,
      searchParams.page,
      searchParams.pageSize,
    ]
  );

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getExercises(memoizedSearchParams);
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exercises'));
    } finally {
      setLoading(false);
    }
  }, [memoizedSearchParams]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return { data, loading, error, refetch: fetchExercises };
}

/**
 * Hook to fetch single exercise by ID
 */
export function useExercise(id: string | null) {
  const [data, setData] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExercise = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getExerciseById(id);
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exercise'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExercise();
  }, [fetchExercise]);

  return { data, loading, error, refetch: fetchExercise };
}

/**
 * Hook to fetch exercise statistics
 */
export function useExerciseStats(id: string | null) {
  const [data, setData] = useState<ExerciseStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getExerciseStats(id);
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exercise stats'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}

/**
 * Hook to fetch review history
 */
export function useReviewHistory(id: string | null) {
  const [data, setData] = useState<ExerciseReviewLog[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getReviewHistory(id);
      if (response.data && response.data.reviewLogs) {
        setData(response.data.reviewLogs);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch review history'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { data, loading, error, refetch: fetchHistory };
}

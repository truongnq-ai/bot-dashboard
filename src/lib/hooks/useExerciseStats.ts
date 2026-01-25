/**
 * Exercise Statistics Hook
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ExerciseStats,
    ExerciseStatsRequest,
} from '@/types/exercise';
import { getExerciseStats } from '@/lib/api/statistics.service';

/**
 * Hook to fetch exercise statistics with filters
 */
export function useExerciseStats(filters: ExerciseStatsRequest) {
    const [data, setData] = useState<ExerciseStats[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { subjectId, topicId, difficulty, type } = filters;

    // Memoize filters to create a stable reference
    const memoizedFilters = useMemo(
        () => ({ subjectId, topicId, difficulty, type }),
        [subjectId, topicId, difficulty, type]
    );

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getExerciseStats(memoizedFilters);
            if (response.errorCode === '0000' && response.data) {
                setData(response.data);
            } else {
                setError(new Error(response.errorDetail || 'Failed to fetch exercise statistics'));
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch exercise statistics'));
        } finally {
            setLoading(false);
        }
    }, [memoizedFilters]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        data,
        loading,
        error,
        refetch: fetchStats,
    };
}

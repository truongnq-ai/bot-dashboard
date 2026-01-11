/**
 * Exercise Hooks with Content - Admin Dashboard
 * Hook for fetching exercises list WITH content field (for selection modal)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ExerciseListItemWithContent,
    ExercisePageRequest,
} from '@/types/exercise';
import { PageResponse, PageRequest } from '@/types/common';
import {
    getExercisesWithContent,
} from '@/lib/api/exercise.service';

/**
 * Hook to fetch exercises list WITH content (for selection modal)
 */
export function useExercisesWithContent(
    pageRequest: PageRequest & { dataRequest?: ExercisePageRequest }
) {
    const [data, setData] = useState<PageResponse<ExerciseListItemWithContent> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Memoize pageRequest to create a stable reference
    // Handle undefined/null values properly for React dependency comparison
    const memoizedPageRequest = useMemo(
        () => ({ ...pageRequest }),
        [
            pageRequest.page,
            pageRequest.pageSize,
            pageRequest.sort ? JSON.stringify(pageRequest.sort) : '',
            pageRequest.dataRequest ? JSON.stringify(pageRequest.dataRequest) : '{}',
        ]
    );

    const fetchExercises = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getExercisesWithContent(memoizedPageRequest);
            if (response.data) {
                setData(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch exercises'));
        } finally {
            setLoading(false);
        }
    }, [memoizedPageRequest]);

    useEffect(() => {
        fetchExercises();
    }, [fetchExercises]);

    return {
        data,
        loading,
        error,
        refetch: fetchExercises,
    };
}

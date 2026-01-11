/**
 * Exercise Hooks - Admin Dashboard
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Exercise,
    ExerciseListItem,
    ExercisePageRequest,
} from '@/types/exercise';
import { PageResponse, PageRequest } from '@/types/common';
import {
    getExercises,
    getExerciseById,
} from '@/lib/api/exercise.service';

/**
 * Hook to fetch exercises list with pagination
 */
export function useExercises(pageRequest: PageRequest & { dataRequest?: ExercisePageRequest }) {
    const [data, setData] = useState<PageResponse<ExerciseListItem> | null>(null);
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
            const response = await getExercises(memoizedPageRequest);
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

    return {
        data,
        loading,
        error,
        refetch: fetchExercise,
    };
}

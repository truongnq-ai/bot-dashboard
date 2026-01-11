/**
 * Exercise Set Hooks - Admin Dashboard
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ExerciseSet,
    ExerciseSetItem,
    ExerciseSetListItem,
    ExerciseSetPageRequest,
} from '@/types/exercise-set';
import { PageResponse, PageRequest } from '@/types/common';
import {
    getExerciseSets,
    getExerciseSetById,
    getExerciseSetExercises,
} from '@/lib/api/exercise-set.service';

/**
 * Hook to fetch exercise sets list with pagination
 */
export function useExerciseSets(pageRequest: PageRequest & { dataRequest?: ExerciseSetPageRequest }) {
    const [data, setData] = useState<PageResponse<ExerciseSetListItem> | null>(null);
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

    const fetchExerciseSets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getExerciseSets(memoizedPageRequest);
            if (response.data) {
                setData(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch exercise sets'));
        } finally {
            setLoading(false);
        }
    }, [memoizedPageRequest]);

    useEffect(() => {
        fetchExerciseSets();
    }, [fetchExerciseSets]);

    return {
        data,
        loading,
        error,
        refetch: fetchExerciseSets,
    };
}

/**
 * Hook to fetch single exercise set by ID
 */
export function useExerciseSet(id: string | null) {
    const [data, setData] = useState<ExerciseSet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchExerciseSet = useCallback(async () => {
        if (!id) {
            setData(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await getExerciseSetById(id);
            if (response.data) {
                setData(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch exercise set'));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchExerciseSet();
    }, [fetchExerciseSet]);

    return {
        data,
        loading,
        error,
        refetch: fetchExerciseSet,
    };
}

/**
 * Hook to fetch exercises of an exercise set (with full details)
 * Use this to get exercises with content, topic, difficulty for display
 */
export function useExerciseSetExercises(exerciseSetId: string | null) {
    const [data, setData] = useState<ExerciseSetItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchExercises = useCallback(async () => {
        if (!exerciseSetId) {
            setData(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await getExerciseSetExercises(exerciseSetId);
            if (response.data) {
                setData(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch exercises'));
        } finally {
            setLoading(false);
        }
    }, [exerciseSetId]);

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

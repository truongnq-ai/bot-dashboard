/**
 * Hook to fetch exercises batch by IDs WITH content
 * Use this when you need to fetch multiple exercises with content (e.g., displaying selected exercises)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ExerciseListItemWithContent } from '@/types/exercise';
import { getExercisesBatch } from '@/lib/api/exercise.service';

/**
 * Hook to fetch exercises batch by IDs
 */
export function useExercisesBatch(exerciseIds: string[]) {
    const [data, setData] = useState<ExerciseListItemWithContent[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Calculate serialized key from array contents
    // This will be the same string value if contents are the same, even if array reference changes
    const exerciseIdsKey = exerciseIds.length === 0
        ? ''
        : [...exerciseIds].sort().join(',');

    // Track previous key to prevent duplicate fetches
    const prevKeyRef = useRef<string>(exerciseIdsKey);
    const exerciseIdsRef = useRef<string[]>(exerciseIds);

    useEffect(() => {
        // Only fetch if the key actually changed (string comparison by value)
        if (prevKeyRef.current !== exerciseIdsKey) {
            prevKeyRef.current = exerciseIdsKey;
            exerciseIdsRef.current = [...exerciseIds];

            const fetchExercises = async () => {
                const ids = exerciseIdsRef.current;
                if (ids.length === 0) {
                    setData([]);
                    setLoading(false);
                    return;
                }

                try {
                    setLoading(true);
                    setError(null);
                    const response = await getExercisesBatch(ids);
                    if (response.data) {
                        setData(response.data);
                    }
                } catch (err) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch exercises'));
                } finally {
                    setLoading(false);
                }
            };

            fetchExercises();
        }
    }, [exerciseIdsKey]);

    // Refetch function for manual triggers
    const refetch = useCallback(async () => {
        const ids = exerciseIdsRef.current;
        if (ids.length === 0) {
            setData([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await getExercisesBatch(ids);
            if (response.data) {
                setData(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch exercises'));
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        data,
        loading,
        error,
        refetch,
    };
}

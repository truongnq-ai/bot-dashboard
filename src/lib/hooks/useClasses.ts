/**
 * Class Hooks (Admin Dashboard)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Class, ClassSearchParams } from '@/types/class';
import { getClasses, getClassById } from '@/lib/api/class.service';

/**
 * Hook to fetch all classes with client-side filtering and pagination
 */
export function useClasses(searchParams: ClassSearchParams = {}) {
    const [allClasses, setAllClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Fetch all classes once
    const fetchClasses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getClasses();
            if (response.errorCode === '0000' && response.data) {
                setAllClasses(response.data);
            } else {
                setError(new Error(response.errorDetail || 'Failed to fetch classes'));
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch classes'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    // Client-side filtering
    const filteredClasses = useMemo(() => {
        if (!searchParams.name || searchParams.name.trim() === '') {
            return allClasses;
        }
        const searchTerm = searchParams.name.toLowerCase().trim();
        return allClasses.filter((classItem) =>
            classItem.name.toLowerCase().includes(searchTerm)
        );
    }, [allClasses, searchParams.name]);

    return {
        data: filteredClasses,
        loading,
        error,
        refetch: fetchClasses,
        totalElements: filteredClasses.length,
    };
}

/**
 * Hook to fetch classes with server-side filters
 * @param subjectId Optional subject ID filter
 * @param name Optional name filter (with debounce support)
 */
export function useClassesWithFilters(subjectId?: string, name?: string) {
    const [allClasses, setAllClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchClasses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getClasses(subjectId, name);
            if (response.errorCode === '0000' && response.data) {
                setAllClasses(response.data);
            } else {
                setError(new Error(response.errorDetail || 'Failed to fetch classes'));
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch classes'));
        } finally {
            setLoading(false);
        }
    }, [subjectId, name]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    return {
        data: allClasses,
        loading,
        error,
        refetch: fetchClasses,
        totalElements: allClasses.length,
    };
}

/**
 * Hook to fetch single class by ID
 */
export function useClass(id: string | null) {
    const [data, setData] = useState<Class | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!id) {
            setData(null);
            setLoading(false);
            return;
        }

        const fetchClass = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getClassById(id);
                if (response.errorCode === '0000' && response.data) {
                    setData(response.data);
                } else {
                    setError(new Error(response.errorDetail || 'Failed to fetch class'));
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch class'));
            } finally {
                setLoading(false);
            }
        };

        fetchClass();
    }, [id]);

    return { data, loading, error };
}

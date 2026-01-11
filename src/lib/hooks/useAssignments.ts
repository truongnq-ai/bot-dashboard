/**
 * Assignment Hooks - Admin Dashboard
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Assignment, AssignmentListItem } from '@/types/assignment';
import { PageRequest, PageResponse } from '@/types/common';
import {
    getAssignments,
    getAssignmentsByClassId,
    getAssignmentById,
} from '@/lib/api/assignment.service';

/**
 * Hook to fetch assignments by class ID
 */
export function useAssignmentsByClass(classId: string | null) {
    const [data, setData] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchAssignments = useCallback(async () => {
        if (!classId) {
            setData([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await getAssignmentsByClassId(classId);
            if (response.errorCode === '0000' && response.data) {
                setData(response.data);
            } else {
                setError(new Error(response.errorDetail || 'Failed to fetch assignments'));
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch assignments'));
        } finally {
            setLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    return { data, loading, error, refetch: fetchAssignments };
}

/**
 * Hook to fetch single assignment by ID
 */
export function useAssignment(id: string | null) {
    const [data, setData] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!id) {
            setData(null);
            setLoading(false);
            return;
        }

        const fetchAssignment = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getAssignmentById(id);
                if (response.errorCode === '0000' && response.data) {
                    setData(response.data);
                } else {
                    setError(new Error(response.errorDetail || 'Failed to fetch assignment'));
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch assignment'));
            } finally {
                setLoading(false);
            }
        };

        fetchAssignment();
    }, [id]);

    return { data, loading, error };
}

/**
 * Hook to fetch paginated assignments with filters
 */
export function useAssignments(pageRequest: PageRequest) {
    const [data, setData] = useState<PageResponse<AssignmentListItem> | null>(null);
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

    const fetchAssignments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAssignments(memoizedPageRequest);
            if (response.errorCode === '0000' && response.data) {
                setData(response.data);
            } else {
                setError(new Error(response.errorDetail || 'Failed to fetch assignments'));
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch assignments'));
        } finally {
            setLoading(false);
        }
    }, [memoizedPageRequest]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    return { data, loading, error, refetch: fetchAssignments };
}

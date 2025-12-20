/**
 * Admin Hooks
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Admin, AdminSearchParams } from '@/types/admin';
import { PageResponse } from '@/types/common';
import { getAdmins, getAdminById } from '@/lib/api/admin.service';

/**
 * Hook to fetch admins list with pagination
 */
export function useAdmins(searchParams: AdminSearchParams = {}) {
  const [data, setData] = useState<PageResponse<Admin> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Store searchParams in ref to use in callback
  const searchParamsRef = useRef<AdminSearchParams>(searchParams);
  searchParamsRef.current = searchParams;
  
  // Serialize searchParams to string for stable comparison
  const searchParamsKey = useMemo(
    () => JSON.stringify(searchParams),
    [
      searchParams.page,
      searchParams.pageSize,
      searchParams.searchText,
      searchParams.status,
      searchParams.role,
      searchParams.sortBy,
      searchParams.sortDirection,
    ]
  );
  
  // Store previous key to detect changes
  const prevKeyRef = useRef<string>('');

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdmins(searchParamsRef.current);
      if (response.errorCode === '0000' && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch admins'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch admins'));
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we use ref

  useEffect(() => {
    // Only fetch if searchParams actually changed
    if (prevKeyRef.current !== searchParamsKey) {
      prevKeyRef.current = searchParamsKey;
      fetchAdmins();
    }
  }, [searchParamsKey, fetchAdmins]);

  return { data, loading, error, refetch: fetchAdmins };
}

/**
 * Hook to fetch single admin by ID
 */
export function useAdmin(id: string | null) {
  const [data, setData] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAdmin = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getAdminById(id);
      if (response.errorCode === '0000' && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch admin'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch admin'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  return { data, loading, error, refetch: fetchAdmin };
}


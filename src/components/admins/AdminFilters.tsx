'use client';

import React from 'react';
import { AdminSearchParams } from '@/types/admin';

interface AdminFiltersProps {
  searchParams: AdminSearchParams;
  onFilterChange: (params: Partial<AdminSearchParams>) => void;
}

export default function AdminFilters({ searchParams, onFilterChange }: AdminFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vai trò
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchParams.role || ''}
            onChange={(e) => onFilterChange({ role: e.target.value || undefined })}
          >
            <option value="">Tất cả</option>
            <option value="ADMIN">Admin</option>
            <option value="PARENT">Phụ huynh</option>
            <option value="STUDENT">Học sinh</option>
          </select>
        </div>
      </div>
    </div>
  );
}


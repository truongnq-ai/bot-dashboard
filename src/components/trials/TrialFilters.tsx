'use client';

import React from 'react';
import { TrialSearchParams, TrialStatus } from '@/types/trial';

interface TrialFiltersProps {
  searchParams: TrialSearchParams;
  onFilterChange: (params: Partial<TrialSearchParams>) => void;
}

export default function TrialFilters({ searchParams, onFilterChange }: TrialFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trạng thái
          </label>
          <select
            value={searchParams.status || ''}
            onChange={(e) =>
              onFilterChange({
                status: e.target.value ? (e.target.value as TrialStatus) : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tất cả</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="EXPIRED">Đã hết hạn</option>
            <option value="CONSUMED">Đã sử dụng</option>
          </select>
        </div>

        {/* User ID Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            User ID
          </label>
          <input
            type="text"
            value={searchParams.userId || ''}
            onChange={(e) => onFilterChange({ userId: e.target.value || undefined })}
            placeholder="Tìm theo User ID..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}


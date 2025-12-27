'use client';

import React from 'react';
import { ParentSearchParams } from '@/types/parent';

interface ParentFiltersProps {
  searchParams: ParentSearchParams;
  onFilterChange: (params: Partial<ParentSearchParams>) => void;
}

export default function ParentFilters({ searchParams, onFilterChange }: ParentFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tìm kiếm
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Username, tên, email hoặc số điện thoại"
            value={searchParams.searchText || ''}
            onChange={(e) => onFilterChange({ searchText: e.target.value || undefined })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Trạng thái
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchParams.status || ''}
            onChange={(e) =>
              onFilterChange({
                status: e.target.value
                  ? (e.target.value as ParentSearchParams['status'])
                  : undefined,
              })
            }
          >
            <option value="">Tất cả</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Không hoạt động</option>
            <option value="LOCKED">Đã khóa</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Xác thực điện thoại
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchParams.phoneVerified === undefined ? '' : searchParams.phoneVerified.toString()}
            onChange={(e) =>
              onFilterChange({
                phoneVerified: e.target.value === '' ? undefined : e.target.value === 'true',
              })
            }
          >
            <option value="">Tất cả</option>
            <option value="true">Đã xác thực</option>
            <option value="false">Chưa xác thực</option>
          </select>
        </div>
      </div>
    </div>
  );
}


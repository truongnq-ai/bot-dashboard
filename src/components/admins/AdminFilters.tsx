'use client';

import React from 'react';
import { AdminSearchParams } from '@/types/admin';

interface AdminFiltersProps {
  searchParams: AdminSearchParams;
  onFilterChange: (params: Partial<AdminSearchParams>) => void;
}

export default function AdminFilters({ searchParams, onFilterChange }: AdminFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vai trò
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            value="ADMIN"
            disabled
          >
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tên đăng nhập
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Tìm theo username..."
            value={searchParams.username || ''}
            onChange={(e) => onFilterChange({ username: e.target.value || undefined })}
          />
        </div>
        <div>
          <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tên
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Tìm theo tên..."
            value={searchParams.name || ''}
            onChange={(e) => onFilterChange({ name: e.target.value || undefined })}
          />
        </div>
    </div>
  );
}


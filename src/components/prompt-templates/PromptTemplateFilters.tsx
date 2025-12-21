'use client';

import React from 'react';
import { PromptTemplateSearchParams } from '@/types/prompt-template';

interface PromptTemplateFiltersProps {
  searchParams: PromptTemplateSearchParams;
  onFilterChange: (params: Partial<PromptTemplateSearchParams>) => void;
}

export default function PromptTemplateFilters({ searchParams, onFilterChange }: PromptTemplateFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tên template
          </label>
          <input
            type="text"
            value={searchParams.name || ''}
            onChange={(e) => onFilterChange({ name: e.target.value || undefined })}
            placeholder="Tìm kiếm theo tên..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Trạng thái
          </label>
          <select
            value={searchParams.isActive === undefined ? '' : searchParams.isActive.toString()}
            onChange={(e) =>
              onFilterChange({
                isActive: e.target.value === '' ? undefined : e.target.value === 'true',
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Tất cả</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Vô hiệu hóa</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => onFilterChange({ name: undefined, isActive: undefined })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
}


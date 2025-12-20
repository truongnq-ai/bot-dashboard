'use client';

import React from 'react';
import { SkillSearchParams } from '@/types/skill';

interface SkillFiltersProps {
  searchParams: SkillSearchParams;
  onFilterChange: (params: Partial<SkillSearchParams>) => void;
}

export default function SkillFilters({ searchParams, onFilterChange }: SkillFiltersProps) {
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
            placeholder="Code, Tên hoặc Chương"
            value={searchParams.searchText || ''}
            onChange={(e) => onFilterChange({ searchText: e.target.value || undefined })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lớp
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchParams.grade || ''}
            onChange={(e) =>
              onFilterChange({
                grade: e.target.value ? (parseInt(e.target.value) as 6 | 7) : undefined,
              })
            }
          >
            <option value="">Tất cả</option>
            <option value="6">Lớp 6</option>
            <option value="7">Lớp 7</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chương
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Tên chương"
            value={searchParams.chapter || ''}
            onChange={(e) => onFilterChange({ chapter: e.target.value || undefined })}
          />
        </div>
      </div>
    </div>
  );
}


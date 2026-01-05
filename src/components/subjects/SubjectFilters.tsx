'use client';

import React, { useState } from 'react';
import { SubjectSearchParams } from '@/types/subject';

interface SubjectFiltersProps {
  searchParams: SubjectSearchParams;
  onFilterChange: (params: Partial<SubjectSearchParams>) => void;
}

export default function SubjectFilters({ searchParams, onFilterChange }: SubjectFiltersProps) {
  const [searchName, setSearchName] = useState(searchParams.name || '');

  const handleSearch = () => {
    onFilterChange({ name: searchName.trim() || undefined });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tìm kiếm theo tên môn học
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Nhập tên môn học..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  );
}


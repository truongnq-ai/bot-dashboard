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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
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
            className="w-full px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Tìm kiếm
          </button>
        </div>
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import { SubjectSearchParams } from '@/types/subject';

interface SubjectFiltersProps {
  searchParams: SubjectSearchParams;
  onFilterChange: (params: Partial<SubjectSearchParams>) => void;
}

export default function SubjectFilters({ searchParams, onFilterChange }: SubjectFiltersProps) {
  const [searchName, setSearchName] = useState(searchParams.name || '');

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onFilterChange({ name: searchName.trim() || undefined });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchName, onFilterChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Nhập tên môn học..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
    </div>
  );
}


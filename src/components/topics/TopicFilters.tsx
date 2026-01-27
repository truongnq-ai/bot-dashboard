'use client';

import React, { useState } from 'react';
import { TopicSearchParams } from '@/types/topic';
import { useSubjects } from '@/lib/hooks/useSubjects';

interface TopicFiltersProps {
  searchParams: TopicSearchParams;
  onFilterChange: (params: Partial<TopicSearchParams>) => void;
}

export default function TopicFilters({ searchParams, onFilterChange }: TopicFiltersProps) {
  const [searchName, setSearchName] = useState(searchParams.name || '');
  const { data: subjects } = useSubjects();

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onFilterChange({ name: searchName.trim() || undefined });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchName, onFilterChange]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subjectId = e.target.value || undefined;
    onFilterChange({ subjectId });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Môn học
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchParams.subjectId || ''}
            onChange={handleSubjectChange}
          >
            <option value="">Tất cả môn học</option>
            {subjects?.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tìm kiếm theo tên topic
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Nhập tên topic..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
    </div>
  );
}


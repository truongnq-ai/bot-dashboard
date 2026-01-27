'use client';

import React from 'react';
import { TeacherSearchParams } from '@/types/teacher';
import { useSearchOptimization } from '@/lib/hooks/useSearchOptimization';

interface TeacherFiltersProps {
  searchParams: TeacherSearchParams;
  onFilterChange: (params: Partial<TeacherSearchParams>) => void;
}

export default function TeacherFilters({ searchParams, onFilterChange }: TeacherFiltersProps) {
  const {
    input: usernameInput,
    setInput: setUsernameInput,
    debouncedValue: debouncedUsername,
  } = useSearchOptimization({
    initialValue: searchParams.username,
  });

  const {
    input: nameInput,
    setInput: setNameInput,
    debouncedValue: debouncedName,
  } = useSearchOptimization({
    initialValue: searchParams.name,
  });

  React.useEffect(() => {
    if (debouncedUsername !== searchParams.username) {
      onFilterChange({ username: debouncedUsername });
    }
  }, [debouncedUsername, searchParams.username, onFilterChange]);

  React.useEffect(() => {
    if (debouncedName !== searchParams.name) {
      onFilterChange({ name: debouncedName });
    }
  }, [debouncedName, searchParams.name, onFilterChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vai trò
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            value="TEACHER"
            disabled
          >
            <option value="TEACHER">Giáo viên</option>
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
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
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
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
        </div>
    </div>
  );
}


'use client';

import React from 'react';
import { StudentSearchParams } from '@/types/student';

interface StudentFiltersProps {
  searchParams: StudentSearchParams;
  onFilterChange: (params: Partial<StudentSearchParams>) => void;
}

export default function StudentFilters({ searchParams, onFilterChange }: StudentFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  ? (e.target.value as StudentSearchParams['status'])
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
            Trạng thái học sinh
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchParams.studentStatus || ''}
            onChange={(e) =>
              onFilterChange({
                studentStatus: e.target.value
                  ? (e.target.value as StudentSearchParams['studentStatus'])
                  : undefined,
              })
            }
          >
            <option value="">Tất cả</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="LINKED">Đã liên kết</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Không hoạt động</option>
          </select>
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
                grade: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
          >
            <option value="">Tất cả</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
              <option key={grade} value={grade}>
                Lớp {grade}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}


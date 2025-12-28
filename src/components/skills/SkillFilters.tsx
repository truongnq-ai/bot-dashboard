'use client';

import React, { useState, useEffect } from 'react';
import { SkillSearchParams } from '@/types/skill';
import { getChaptersByGrade } from '@/lib/api/chapter.service';
import { Chapter } from '@/types/chapter';

interface SkillFiltersProps {
  searchParams: SkillSearchParams;
  onFilterChange: (params: Partial<SkillSearchParams>) => void;
}

export default function SkillFilters({ searchParams, onFilterChange }: SkillFiltersProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  // Fetch chapters by grade when grade is selected
  useEffect(() => {
    const fetchChapters = async () => {
      if (searchParams.grade) {
        setChaptersLoading(true);
        try {
          const response = await getChaptersByGrade(searchParams.grade);
          if (response.errorCode === '0000' && response.data) {
            setChapters(response.data);
          }
        } catch (error) {
          console.error('Failed to fetch chapters:', error);
        } finally {
          setChaptersLoading(false);
        }
      } else {
        setChapters([]);
      }
    };
    fetchChapters();
  }, [searchParams.grade]);

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
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchParams.chapterId || ''}
            onChange={(e) => onFilterChange({ chapterId: e.target.value || undefined })}
            disabled={!searchParams.grade || chaptersLoading}
          >
            <option value="">{!searchParams.grade ? 'Chọn lớp trước' : chaptersLoading ? 'Đang tải...' : 'Tất cả'}</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.code} - {chapter.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}


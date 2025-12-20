/**
 * Exercise List Component
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useExercises } from '@/lib/hooks/useExercises';
import { ExerciseSearchParams, ReviewStatus } from '@/types/exercise';
import ExerciseListTable from './ExerciseListTable';
import { useSkills } from '@/lib/hooks/useSkills';

export default function ExerciseList() {
  const [searchParams, setSearchParams] = useState<ExerciseSearchParams>({
    page: 0,
    pageSize: 10,
  });

  const { data, loading, error, refetch } = useExercises(searchParams);
  const { data: skillsData } = useSkills();

  const statistics = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };
    }

    // Note: These would ideally come from a stats endpoint
    // For now, we'll calculate from the current page data
    const exercises = data.content || [];
    return {
      total: data.totalElements || 0,
      pending: exercises.filter((e) => e.reviewStatus === ReviewStatus.PENDING).length,
      approved: exercises.filter((e) => e.reviewStatus === ReviewStatus.APPROVED).length,
      rejected: exercises.filter((e) => e.reviewStatus === ReviewStatus.REJECTED).length,
    };
  }, [data]);

  const handleFilterChange = (newParams: Partial<ExerciseSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...newParams, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setSearchParams((prev) => ({ ...prev, pageSize, page: 0 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exercises</h1>
        <a
          href="/content/exercises/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Exercise
        </a>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
          <div className="text-2xl font-bold text-green-600">{statistics.approved}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
          <div className="text-2xl font-bold text-red-600">{statistics.rejected}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Skill
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchParams.skillId || ''}
              onChange={(e) => handleFilterChange({ skillId: e.target.value || undefined })}
            >
              <option value="">All Skills</option>
              {skillsData?.content?.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Grade
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchParams.grade || ''}
              onChange={(e) =>
                handleFilterChange({ grade: e.target.value ? parseInt(e.target.value) : undefined })
              }
            >
              <option value="">All Grades</option>
              <option value="6">Grade 6</option>
              <option value="7">Grade 7</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchParams.reviewStatus || ''}
              onChange={(e) =>
                handleFilterChange({ reviewStatus: (e.target.value as ReviewStatus) || undefined })
              }
            >
              <option value="">All Statuses</option>
              <option value={ReviewStatus.PENDING}>Pending</option>
              <option value={ReviewStatus.APPROVED}>Approved</option>
              <option value={ReviewStatus.REJECTED}>Rejected</option>
              <option value={ReviewStatus.NEEDS_REVISION}>Needs Revision</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Search exercises..."
              value={searchParams.searchText || ''}
              onChange={(e) => handleFilterChange({ searchText: e.target.value || undefined })}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading && <div className="text-center py-8">Loading...</div>}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error: {error.message}</p>
        </div>
      )}
      {!loading && !error && data && (
        <ExerciseListTable
          exercises={data.content}
          onDelete={refetch}
          pagination={{
            page: searchParams.page || 0,
            pageSize: searchParams.pageSize || 10,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      )}
    </div>
  );
}

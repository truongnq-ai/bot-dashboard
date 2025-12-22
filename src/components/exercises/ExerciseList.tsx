/**
 * Exercise List Component
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useExercises } from '@/lib/hooks/useExercises';
import { ExerciseSearchParams, ReviewStatus, Exercise } from '@/types/exercise';
import ExerciseListTable from './ExerciseListTable';
import ExerciseGenerateModal from './ExerciseGenerateModal';
import ExercisePreviewModal from './ExercisePreviewModal';
import { useSkills } from '@/lib/hooks/useSkills';
import { useGrades } from '@/lib/hooks/useGrades';
import { Skill } from '@/types/skill';

export default function ExerciseList() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<ExerciseSearchParams>({
    page: 0,
    pageSize: 10,
  });

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [generatedExercises, setGeneratedExercises] = useState<Exercise[]>([]);
  const [generationMetadata, setGenerationMetadata] = useState<{
    providerUsed?: string;
    overallConfidence?: number;
    totalGenerated?: number;
    totalValid?: number;
  }>();

  const { data, loading, error, refetch } = useExercises(searchParams);
  const { data: skillsData } = useSkills({
    grade: searchParams.grade as 6 | 7 | undefined,
    pageSize: 1000,
    sortBy: 'code',
    sortDirection: 'asc',
  });
  const { data: gradesData } = useGrades();

  // Sort skills by code alphabetically
  const sortedSkills = useMemo(() => {
    if (!skillsData?.content) return [];
    return [...skillsData.content].sort((a, b) => {
      return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [skillsData]);

  // Reset skillId when grade changes and selected skill doesn't belong to new grade
  useEffect(() => {
    if (searchParams.grade && searchParams.skillId) {
      const selectedSkill = sortedSkills.find((s) => s.id === searchParams.skillId);
      if (selectedSkill && selectedSkill.grade !== searchParams.grade) {
        setSearchParams((prev) => ({ ...prev, skillId: undefined, page: 0 }));
      }
    }
  }, [searchParams.grade, searchParams.skillId, sortedSkills]);

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

  const handleGenerateSuccess = (exercises: Exercise[], metadata?: {
    providerUsed?: string;
    overallConfidence?: number;
    totalGenerated?: number;
    totalValid?: number;
  }) => {
    setGeneratedExercises(exercises);
    setGenerationMetadata(metadata);
    setIsPreviewModalOpen(true);
    refetch(); // Refresh the list
  };

  const handleViewDetail = (exerciseId: string) => {
    router.push(`/content/exercises/${exerciseId}`);
    setIsPreviewModalOpen(false);
  };

  const handleBulkApprove = () => {
    refetch();
  };

  const handleBulkReject = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bài tập</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Tạo với AI
          </button>
          <a
            href="/content/exercises/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tạo bài tập
          </a>
        </div>
      </div>

      {/* Modals */}
      <ExerciseGenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={(exercises, metadata) => handleGenerateSuccess(exercises, metadata)}
      />
      <ExercisePreviewModal
        isOpen={isPreviewModalOpen}
        exercises={generatedExercises}
        generationMetadata={generationMetadata}
        onClose={() => setIsPreviewModalOpen(false)}
        onViewDetail={handleViewDetail}
        onBulkApprove={handleBulkApprove}
        onBulkReject={handleBulkReject}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Tổng</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Chờ duyệt</div>
          <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Đã duyệt</div>
          <div className="text-2xl font-bold text-green-600">{statistics.approved}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Đã từ chối</div>
          <div className="text-2xl font-bold text-red-600">{statistics.rejected}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lớp
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchParams.grade || ''}
              onChange={(e) => {
                const newGrade = e.target.value ? parseInt(e.target.value) : undefined;
                handleFilterChange({ 
                  grade: newGrade,
                  skillId: undefined, // Reset skill when grade changes
                });
              }}
            >
              <option value="">Tất cả lớp</option>
              {gradesData?.map((grade) => (
                <option key={grade} value={grade}>
                  Lớp {grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kỹ năng
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchParams.skillId || ''}
              onChange={(e) => handleFilterChange({ skillId: e.target.value || undefined })}
            >
              <option value="">Tất cả kỹ năng</option>
              {sortedSkills.map((skill: Skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.code} - {skill.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trạng thái
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchParams.reviewStatus || ''}
              onChange={(e) =>
                handleFilterChange({ reviewStatus: (e.target.value as ReviewStatus) || undefined })
              }
            >
              <option value="">Tất cả trạng thái</option>
              <option value={ReviewStatus.PENDING}>Chờ duyệt</option>
              <option value={ReviewStatus.APPROVED}>Đã duyệt</option>
              <option value={ReviewStatus.REJECTED}>Đã từ chối</option>
              <option value={ReviewStatus.NEEDS_REVISION}>Cần chỉnh sửa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Tìm kiếm bài tập..."
              value={searchParams.searchText || ''}
              onChange={(e) => handleFilterChange({ searchText: e.target.value || undefined })}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading && <div className="text-center py-8">Đang tải...</div>}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Lỗi: {error.message}</p>
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

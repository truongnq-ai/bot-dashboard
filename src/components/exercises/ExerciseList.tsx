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
import { getChaptersByGrade, getChapterSkills } from '@/lib/api/chapter.service';
import { Chapter, ChapterSkillDetail } from '@/types/chapter';
import { isPhase1FeatureEnabled } from '@/lib/config/phase1-features.config';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { ChevronDownIcon, PlusIcon, PencilIcon, BoltIcon, FileIcon } from '@/icons';

export default function ExerciseList() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<ExerciseSearchParams>({
    page: 0,
    pageSize: 10,
  });

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [generatedExercises, setGeneratedExercises] = useState<Exercise[]>([]);
  const [generationMetadata, setGenerationMetadata] = useState<{
    providerUsed?: string;
    overallConfidence?: number;
    totalGenerated?: number;
    totalValid?: number;
  }>();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [chapterSkills, setChapterSkills] = useState<ChapterSkillDetail[]>([]);
  const [chapterSkillsLoading, setChapterSkillsLoading] = useState(false);

  const { data, loading, error, refetch } = useExercises(searchParams);

  // Fetch chapters by grade when grade is selected
  useEffect(() => {
    const fetchChapters = async () => {
      if (searchParams.grade) {
        setChaptersLoading(true);
        try {
          const response = await getChaptersByGrade(searchParams.grade as 6 | 7);
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

  // Reset chapterId and skillId when grade is cleared
  useEffect(() => {
    if (!searchParams.grade && (searchParams.chapterId || searchParams.skillId)) {
      setSearchParams((prev) => ({ ...prev, chapterId: undefined, skillId: undefined, page: 0 }));
    }
  }, [searchParams.grade]);

  // Fetch skills by chapter when chapter is selected
  useEffect(() => {
    const fetchChapterSkills = async () => {
      if (searchParams.chapterId) {
        setChapterSkillsLoading(true);
        try {
          const response = await getChapterSkills(searchParams.chapterId);
          if (response.errorCode === '0000' && response.data) {
            // Sort skills by code alphabetically
            const sorted = [...response.data].sort((a, b) => {
              return a.skillCode.localeCompare(b.skillCode, undefined, { numeric: true, sensitivity: 'base' });
            });
            setChapterSkills(sorted);
          }
        } catch (error) {
          console.error('Failed to fetch chapter skills:', error);
        } finally {
          setChapterSkillsLoading(false);
        }
      } else {
        setChapterSkills([]);
      }
    };
    fetchChapterSkills();
  }, [searchParams.chapterId]);

  // Reset skillId when chapter is cleared
  useEffect(() => {
    if (!searchParams.chapterId && searchParams.skillId) {
      setSearchParams((prev) => ({ ...prev, skillId: undefined, page: 0 }));
    }
  }, [searchParams.chapterId]);


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
        <div className="relative">
          <button
            onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dropdown-toggle"
          >
            <PlusIcon className="w-4 h-4" />
            Tạo bài tập
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isCreateDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          <Dropdown
            isOpen={isCreateDropdownOpen}
            onClose={() => setIsCreateDropdownOpen(false)}
            className="absolute right-0 mt-2 w-56"
          >
            <DropdownItem
              tag="a"
              href="/content/exercises/create"
              onItemClick={() => setIsCreateDropdownOpen(false)}
              baseClassName="relative flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors border-b-2 border-blue-200/30 dark:border-blue-800/30 hover:border-blue-300/60 dark:hover:border-blue-700/50"
            >
              <PencilIcon className="w-4 h-4 text-blue-500/80 dark:text-blue-400/80" />
              Tạo thủ công
            </DropdownItem>
            <DropdownItem
              onItemClick={() => {
                setIsCreateDropdownOpen(false);
                setIsGenerateModalOpen(true);
              }}
              baseClassName="relative flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors border-b-2 border-amber-200/30 dark:border-amber-800/30 hover:border-amber-300/60 dark:hover:border-amber-700/50"
            >
              <BoltIcon className="w-4 h-4 text-amber-500/80 dark:text-amber-400/80" />
              Tạo với AI
            </DropdownItem>
            <DropdownItem
              tag="button"
              onItemClick={() => {
                setIsCreateDropdownOpen(false);
                router.push('/content/exercises/create-from-json');
              }}
              baseClassName="relative flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-colors border-b-2 border-green-200/30 dark:border-green-800/30 hover:border-green-300/60 dark:hover:border-green-700/50"
            >
              <FileIcon className="w-4 h-4 text-green-500/80 dark:text-green-400/80" />
              Tạo từ JSON
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Modals */}
      {isPhase1FeatureEnabled('AI_GENERATION') && (
        <ExerciseGenerateModal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          onSuccess={(exercises, metadata) => handleGenerateSuccess(exercises, metadata)}
        />
      )}
      <ExercisePreviewModal
        isOpen={isPreviewModalOpen}
        exercises={generatedExercises}
        generationMetadata={generationMetadata}
        onClose={() => setIsPreviewModalOpen(false)}
        onViewDetail={handleViewDetail}
        onBulkApprove={handleBulkApprove}
        onBulkReject={handleBulkReject}
      />

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
                  chapterId: undefined, // Reset chapter when grade changes
                });
              }}
            >
              <option value="">Tất cả lớp</option>
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
              onChange={(e) => handleFilterChange({ chapterId: e.target.value || undefined })}
              disabled={!searchParams.grade || chaptersLoading}
            >
              <option value="">{!searchParams.grade ? 'Chọn lớp trước' : chaptersLoading ? 'Đang tải...' : 'Tất cả chương'}</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.code} - {chapter.name}
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
              disabled={!searchParams.chapterId || chapterSkillsLoading}
            >
              <option value="">
                {!searchParams.chapterId 
                  ? 'Chọn chương trước' 
                  : chapterSkillsLoading 
                    ? 'Đang tải...' 
                    : 'Tất cả kỹ năng'}
              </option>
              {chapterSkills.map((chapterSkill) => (
                <option key={chapterSkill.skillId} value={chapterSkill.skillId}>
                  {chapterSkill.skillCode} - {chapterSkill.skillName}
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
                handleFilterChange({ reviewStatus: e.target.value || undefined })
              }
            >
              <option value="">Tất cả trạng thái</option>
              <option value="DRAFT">DRAFT (Chờ duyệt)</option>
              <option value="REVIEWED">REVIEWED (Chờ duyệt)</option>
              <option value="APPROVED">APPROVED (Đã duyệt)</option>
            </select>
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

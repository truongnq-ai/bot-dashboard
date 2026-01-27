/**
 * Exercise List Component - Admin Dashboard
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useExercises } from '@/lib/hooks/useExercises';
import { ExercisePageRequest, ExerciseStatus, ExerciseType } from '@/types/exercise';
import { PageRequest } from '@/types/common';
import ExerciseListTable from './ExerciseListTable';
import { useSubjects } from '@/lib/hooks/useSubjects';
import { useTopics } from '@/lib/hooks/useTopics';
// Import local copy of TreeSelect if path is different or if it was cloned to a specific location
// Assuming it was cloned to components/form based on previous steps
import TopicTreeSelect from '@/components/form/TreeSelect';
import { getExerciseTypeOptions } from '@/lib/utils/formatters';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { PlusIcon } from '@/icons'; // Ensure icons are exported from '@/icons' or adjust path
// Adjust Icon imports if needed, assuming basic icons are available
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

// Temporary Icon placeholders if not available in @/icons index yet or mismatch
const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
);
const PencilIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
);

export default function ExerciseList() {
    const router = useRouter();
    const [pageRequest, setPageRequest] = useState<PageRequest>({
        page: 0,
        pageSize: 10,
        dataRequest: {} as ExercisePageRequest,
    });
    const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);

    // Hook usages
    const { data, loading, error, refetch } = useExercises(pageRequest);
    // Admin dashboard hooks for subjects/topics might differ in returned structure, 
    // ensure compatibility or adjust accordingly. 
    // Assuming standard useSubjects/useTopics return format: { data: [], loading: boolean }
    const { data: subjects } = useSubjects();

    // Only fetch topics when subjectId is selected
    const selectedSubjectId = pageRequest.dataRequest?.subjectId;
    const { data: topics, loading: topicsLoading } = useTopics(
        selectedSubjectId ? { subjectId: selectedSubjectId } : {}
    );

    // Local filters state for manual search
    const [filters, setFilters] = useState<ExercisePageRequest>(pageRequest.dataRequest);

    // Reset topicId when subjectId changes in local filters
    const currentTopicId = useMemo(() => {
        if (!filters.subjectId) {
            return undefined;
        }
        return filters.topicId;
    }, [filters.subjectId, filters.topicId]);

    // Update local filter state
    const handleLocalFilterChange = (newFilters: Partial<ExercisePageRequest>) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
        }));
    };

    // Trigger search when user clicks button
    const handleSearch = () => {
        setPageRequest((prev) => ({
            ...prev,
            page: 0,
            dataRequest: filters,
        }));
    };

    const handlePageChange = (page: number) => {
        setPageRequest((prev) => ({ ...prev, page }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPageRequest((prev) => ({ ...prev, pageSize, page: 0 }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Quản lý bài tập</h1>
                <div className="relative">
                    <button
                        onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors dropdown-toggle"
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
                            href="/exercises/create"
                            onItemClick={() => setIsCreateDropdownOpen(false)}
                            baseClassName="relative flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors"
                        >
                            <PencilIcon className="w-4 h-4 text-brand-500/80 dark:text-brand-400/80" />
                            Tạo thủ công
                        </DropdownItem>
                        {/* Removed AI and File Upload options for Admin Dashboard per request */}
                    </Dropdown>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 items-end">
                    <div className="md:col-span-1 lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tìm kiếm
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            placeholder="Nội dung, lời giải..."
                            value={filters.search || ''}
                            onChange={(e) => handleLocalFilterChange({ search: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Môn học
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            value={filters.subjectId || ''}
                            onChange={(e) =>
                                handleLocalFilterChange({
                                    subjectId: e.target.value || undefined,
                                    topicId: undefined, // Reset topic when subject changes
                                })
                            }
                        >
                            <option value="">Tất cả</option>
                            {subjects?.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Chủ đề
                        </label>
                        <TopicTreeSelect
                            value={currentTopicId}
                            onChange={(value) => handleLocalFilterChange({ topicId: value || undefined })}
                            treeData={topics || []}
                            placeholder={
                                !filters.subjectId
                                    ? 'Chọn môn học trước'
                                    : topicsLoading
                                        ? 'Đang tải...'
                                        : !topics || topics.length === 0
                                            ? 'Không có chủ đề'
                                            : 'Chọn chủ đề'
                            }
                            disabled={!filters.subjectId || topicsLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Trạng thái
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            value={filters.status || ''}
                            onChange={(e) =>
                                handleLocalFilterChange({ status: (e.target.value as ExerciseStatus) || undefined })
                            }
                        >
                            <option value="">Tất cả</option>
                            <option value={ExerciseStatus.DRAFT}>Nháp</option>
                            <option value={ExerciseStatus.APPROVED}>Đã duyệt</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Độ khó
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            value={filters.difficulty || ''}
                            onChange={(e) =>
                                handleLocalFilterChange({ difficulty: e.target.value ? parseInt(e.target.value) : undefined })
                            }
                        >
                            <option value="">Tất cả</option>
                            <option value="1">1 - Rất dễ</option>
                            <option value="2">2 - Dễ</option>
                            <option value="3">3 - Trung bình</option>
                            <option value="4">4 - Khó</option>
                            <option value="5">5 - Rất khó</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Loại bài tập
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            value={filters.type || ''}
                            onChange={(e) =>
                                handleLocalFilterChange({ type: (e.target.value as ExerciseType) || undefined })
                            }
                        >
                            <option value="">Tất cả</option>
                            {getExerciseTypeOptions().map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-start-4 lg:col-start-7 flex justify-end">
                        <button
                            onClick={handleSearch}
                            className="w-2/3 px-4 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium shadow-sm active:scale-[0.98]"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && <LoadingState message="Đang tải danh sách bài tập..." />}

            {/* Error State */}
            {error && !loading && (
                <ErrorState
                    message={error.message || 'Có lỗi xảy ra khi tải danh sách bài tập'}
                    action={{
                        label: 'Thử lại',
                        onClick: () => refetch(),
                    }}
                />
            )}

            {/* Table */}
            {!loading && !error && data && (
                <ExerciseListTable
                    exercises={data.content || []}
                    onRefresh={refetch}
                    pagination={{
                        page: data.page,
                        pageSize: data.pageSize,
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

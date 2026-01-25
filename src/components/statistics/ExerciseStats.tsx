/**
 * Exercise Statistics Component
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useExerciseStats } from '@/lib/hooks/useExerciseStats';
import { ExerciseStatsRequest, ExerciseType } from '@/types/exercise';
import { useSubjects } from '@/lib/hooks/useSubjects';
import { useTopics } from '@/lib/hooks/useTopics';
import TreeSelect from '@/components/form/TreeSelect';
import { getExerciseTypeOptions } from '@/lib/utils/formatters';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import ExerciseStatsTable from './ExerciseStatsTable';

export default function ExerciseStats() {
    const [filters, setFilters] = useState<ExerciseStatsRequest>({
        subjectId: undefined,
        topicId: undefined,
        difficulty: undefined,
        type: undefined,
    });

    // Hook usages
    const { data, loading, error, refetch } = useExerciseStats(filters);
    const { data: subjects } = useSubjects();

    // Only fetch topics when subjectId is selected
    const { data: topics, loading: topicsLoading } = useTopics(
        filters.subjectId ? { subjectId: filters.subjectId } : {}
    );

    const handleFilterChange = (newFilters: Partial<ExerciseStatsRequest>) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
        }));
    };

    const handleSubjectChange = (subjectId: string) => {
        handleFilterChange({
            subjectId: subjectId || undefined,
            topicId: undefined, // Reset topic when subject changes
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Thống kê bài tập</h1>
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                >
                    Làm mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Môn học
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            value={filters.subjectId || ''}
                            onChange={(e) => handleSubjectChange(e.target.value)}
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
                        <TreeSelect
                            value={filters.topicId}
                            onChange={(value) => handleFilterChange({ topicId: value || undefined })}
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
                            Độ khó
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            value={filters.difficulty || ''}
                            onChange={(e) =>
                                handleFilterChange({ difficulty: e.target.value ? parseInt(e.target.value) : undefined })
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
                            onChange={(e) => handleFilterChange({ type: (e.target.value as ExerciseType) || undefined })}
                        >
                            <option value="">Tất cả</option>
                            {getExerciseTypeOptions().map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content States */}
            {loading && <LoadingState message="Đang tải dữ liệu thống kê..." />}

            {error && !loading && (
                <ErrorState
                    message={error.message || 'Có lỗi xảy ra khi tải dữ liệu thống kê'}
                    action={{
                        label: 'Thử lại',
                        onClick: () => refetch(),
                    }}
                />
            )}

            {!loading && !error && data && (
                <ExerciseStatsTable stats={data} />
            )}
        </div>
    );
}

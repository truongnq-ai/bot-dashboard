/**
 * Select Exercises Content Component - Admin Dashboard
 */

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ExerciseListItemWithContent } from '@/types/exercise';
import { useExercisesWithContent } from '@/lib/hooks/useExercisesWithContent';
import { useExercisesBatch } from '@/lib/hooks/useExercisesBatch';
import { useExerciseSetExercises, useExerciseSet } from '@/lib/hooks/useExerciseSets';
import { ExercisePageRequest, ExerciseStatus } from '@/types/exercise';
import { PageRequest } from '@/types/common';
import { useSubjects } from '@/lib/hooks/useSubjects';
import { useTopics } from '@/lib/hooks/useTopics';
import TopicTreeSelect from '@/components/form/TreeSelect';
import { toast } from 'react-hot-toast';
import { getDifficultyLabel } from '@/lib/utils/formatters';
import { useReturnUrl } from '@/hooks/useReturnUrl';
import { updateExerciseSet } from '@/lib/api/exercise-set.service';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { useReferenceData } from '@/context/ReferenceDataContext';

export default function SelectExercisesContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const exerciseSetId = params.id as string;
    const { goBack } = useReturnUrl(`/exercise-sets/${exerciseSetId}/edit`);

    // Fetch exercise set to get current exercises
    const { data: exerciseSet, loading: loadingExerciseSet } = useExerciseSet(exerciseSetId);
    const currentExerciseIds = useMemo(() => {
        return exerciseSet?.exercises.map((e) => e.exerciseId) || [];
    }, [exerciseSet]);

    const initialSubjectId = useMemo(() => {
        return exerciseSet?.exercises[0]?.exerciseSubjectId;
    }, [exerciseSet]);

    const [filterSubjectId, setFilterSubjectId] = useState<string>('');
    const [filterTopicId, setFilterTopicId] = useState<string>('');
    const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const isSyncingRef = useRef(false);

    const [searchPageRequest, setSearchPageRequest] = useState<PageRequest>({
        page: 0,
        pageSize: 20,
        dataRequest: {
            status: ExerciseStatus.APPROVED,
        } as ExercisePageRequest,
    });

    const { data: subjects } = useSubjects();
    const { data: topics, loading: topicsLoading } = useTopics(
        filterSubjectId ? { subjectId: filterSubjectId } : {}
    );
    const { getTopicName } = useReferenceData();
    const { data: searchResults, loading: searchLoading } = useExercisesWithContent(searchPageRequest);

    // Logic to decide which API to use for "Đã chọn" list
    const shouldUseExerciseSetApi = useMemo(() => {
        if (!exerciseSetId || !currentExerciseIds || currentExerciseIds.length === 0) {
            return false;
        }
        // Always use exercise set API if we have the exercise set data
        return true;
    }, [exerciseSetId, currentExerciseIds]);

    // Fetch exercises for "Đã chọn" list
    const { data: exerciseSetExercises, loading: loadingExerciseSetExercises } =
        useExerciseSetExercises(shouldUseExerciseSetApi ? (exerciseSetId ?? null) : null);
    const { data: batchExercises, loading: loadingBatchExercises } = useExercisesBatch(
        shouldUseExerciseSetApi ? [] : currentExerciseIds
    );

    // Combine data from both sources
    const selectedExercises = useMemo(() => {
        if (shouldUseExerciseSetApi && exerciseSetExercises) {
            // Convert ExerciseSetItem to ExerciseListItemWithContent format
            return exerciseSetExercises.map((item) => ({
                id: item.exerciseId,
                teacherId: '',
                subjectId: item.exerciseSubjectId,
                topicId: item.exerciseTopicId,
                contentLatex: item.exerciseContentLatex,
                content: item.exerciseContent,
                difficulty: item.exerciseDifficulty,
                type: undefined,
                status: ExerciseStatus.APPROVED,
                createdBy: '',
                createdAt: '',
                updatedAt: '',
            }));
        } else if (!shouldUseExerciseSetApi && batchExercises) {
            const exerciseMap = new Map(batchExercises.map((e) => [e.id, e]));
            return currentExerciseIds.map((id) => exerciseMap.get(id)).filter((e) => e !== undefined) as ExerciseListItemWithContent[];
        }
        return [];
    }, [shouldUseExerciseSetApi, exerciseSetExercises, batchExercises, currentExerciseIds]);

    const loadingSelectedExercises = shouldUseExerciseSetApi
        ? loadingExerciseSetExercises
        : loadingBatchExercises;

    // Sync initialSubjectId when component mounts or exerciseSet changes
    useEffect(() => {
        if (initialSubjectId && !filterSubjectId) {
            isSyncingRef.current = true;
            setFilterSubjectId(initialSubjectId);
            setFilterTopicId('');
            setSearchPageRequest((prev) => ({
                ...prev,
                page: 0,
                dataRequest: {
                    ...prev.dataRequest,
                    subjectId: initialSubjectId || undefined,
                    topicId: undefined,
                },
            }));
            setTimeout(() => {
                isSyncingRef.current = false;
            }, 100);
        }
    }, [initialSubjectId, filterSubjectId]);

    // Reset topic when subject changes and show warning if different from initialSubjectId
    useEffect(() => {
        if (filterSubjectId) {
            // Show warning if user changed subject from initialSubjectId (not during sync)
            if (
                initialSubjectId &&
                filterSubjectId !== initialSubjectId &&
                !isSyncingRef.current
            ) {
                const subjectName = subjects?.find((s) => s.id === filterSubjectId)?.name || 'môn học này';
                const initialSubjectName = subjects?.find((s) => s.id === initialSubjectId)?.name || 'môn học ban đầu';
                toast((t) => (
                    <div>
                        Bạn đã thay đổi môn học từ "{initialSubjectName}" sang "{subjectName}". Đề bài ban đầu thuộc "{initialSubjectName}".
                    </div>
                ), { duration: 5000, icon: '⚠️' });
            }

            setFilterTopicId('');
            setSearchPageRequest((prev) => ({
                ...prev,
                page: 0,
                dataRequest: {
                    ...prev.dataRequest,
                    subjectId: filterSubjectId || undefined,
                    topicId: undefined,
                },
            }));
        }
    }, [filterSubjectId, initialSubjectId, subjects]);

    // Reset selected exercises when page changes
    useEffect(() => {
        setSelectedExerciseIds([]);
    }, [searchPageRequest.page]);

    const handleSubjectChange = (subjectId: string) => {
        setFilterSubjectId(subjectId);
    };

    const handleTopicChange = (topicId: string) => {
        setFilterTopicId(topicId);
        setSearchPageRequest((prev) => ({
            ...prev,
            page: 0,
            dataRequest: {
                ...prev.dataRequest,
                topicId: topicId || undefined,
            },
        }));
    };

    const handleToggleExerciseSelection = (exerciseId: string) => {
        // Don't allow selecting exercises already in the set
        if (currentExerciseIds.includes(exerciseId)) {
            return;
        }

        setSelectedExerciseIds((prev) => {
            if (prev.includes(exerciseId)) {
                return prev.filter((id) => id !== exerciseId);
            } else {
                return [...prev, exerciseId];
            }
        });
    };

    const handleConfirmSelection = async () => {
        if (selectedExerciseIds.length === 0) {
            return;
        }

        // Validate: no duplicates
        const allIds = [...currentExerciseIds, ...selectedExerciseIds];
        const uniqueIds = Array.from(new Set(allIds));

        if (uniqueIds.length !== allIds.length) {
            toast.error('Không được thêm cùng một bài tập nhiều lần');
            return;
        }

        try {
            setIsSaving(true);
            await updateExerciseSet(exerciseSetId, {
                exerciseIds: uniqueIds,
            });
            toast.success('Thêm bài tập thành công');
            goBack();
        } catch (error) {
            toast.error('Thêm bài tập thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        goBack();
    };

    // All exercises from search (for display in "not selected" list)
    const allExercises = useMemo(() => {
        return searchResults?.content || [];
    }, [searchResults?.content]);

    // Loading state for exercise set
    if (loadingExerciseSet) {
        return <LoadingState message="Đang tải thông tin đề bài..." fullHeight />;
    }

    // Error state if exercise set not found
    if (!exerciseSet) {
        return (
            <ErrorState
                message="Đề bài không tồn tại hoặc đã bị xóa."
                action={{
                    label: 'Quay lại',
                    onClick: goBack,
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Chọn bài tập</h1>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                    Quay lại
                </button>
            </div>

            {/* 1. Đã chọn */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Đã chọn ({currentExerciseIds.length})
                </h2>
                {loadingSelectedExercises ? (
                    <LoadingState message="Đang tải danh sách bài tập đã chọn..." />
                ) : currentExerciseIds.length === 0 ? (
                    <EmptyState
                        title="Chưa có bài tập nào trong đề"
                        message="Sử dụng bộ lọc bên dưới để tìm và thêm bài tập."
                    />
                ) : (
                    <div className="space-y-2">
                        {selectedExercises.map((exercise) => (
                            <div
                                key={exercise.id}
                                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Topic: {exercise.topicId || '-'}
                                        </p>
                                        <div
                                            className="text-sm text-gray-700 dark:text-gray-300 line-clamp-5 mt-1 prose max-w-none"
                                            dangerouslySetInnerHTML={{ __html: exercise.content }}
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Độ khó: {getDifficultyLabel(exercise.difficulty)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subject Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Lọc theo môn học
                    </label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={filterSubjectId}
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

                {/* Topic Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Lọc theo chủ đề
                    </label>
                    <TopicTreeSelect
                        value={filterTopicId}
                        onChange={handleTopicChange}
                        treeData={topics || []}
                        placeholder={
                            !filterSubjectId
                                ? 'Chọn môn học trước'
                                : topicsLoading
                                    ? 'Đang tải...'
                                    : !topics || topics.length === 0
                                        ? 'Không có chủ đề'
                                        : 'Chọn chủ đề'
                        }
                        disabled={!filterSubjectId || topicsLoading}
                    />
                </div>
            </div>

            {/* 3. Chưa chọn */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Chưa chọn ({allExercises.length})
                </h2>
                {searchLoading ? (
                    <LoadingState message="Đang tải danh sách bài tập..." />
                ) : allExercises.length === 0 ? (
                    <EmptyState
                        title="Không tìm thấy bài tập nào"
                        message="Thử thay đổi bộ lọc để tìm thêm bài tập."
                    />
                ) : (
                    <div className="space-y-2">
                        {allExercises.map((exercise) => {
                            const isSelected = selectedExerciseIds.includes(exercise.id);
                            const isDisabled = currentExerciseIds.includes(exercise.id);
                            const topicName = getTopicName(exercise.topicId || '') || exercise.topicId || '-';

                            return (
                                <div
                                    key={exercise.id}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${isDisabled
                                        ? 'border-gray-300 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                                        : isSelected
                                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700'
                                        }`}
                                    onClick={() => !isDisabled && handleToggleExerciseSelection(exercise.id)}
                                >
                                    <div className="space-y-1">
                                        {/* Topic */}
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Topic: {topicName}
                                        </p>
                                        {/* Content (5 lines max) */}
                                        <div
                                            className="text-sm text-gray-700 dark:text-gray-300 line-clamp-5"
                                            dangerouslySetInnerHTML={{ __html: exercise.content || '' }}
                                        />
                                        {/* Difficulty */}
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Độ khó: {getDifficultyLabel(exercise.difficulty)}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <span className="text-xs text-brand-600 dark:text-brand-400 mt-1 block">
                                            ✓ Đã chọn
                                        </span>
                                    )}
                                    {isDisabled && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                                            Đã có trong đề
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {searchResults && searchResults.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Trang {searchResults.page + 1} / {searchResults.totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                setSearchPageRequest((prev) => ({ ...prev, page: prev.page - 1 }))
                            }
                            disabled={searchResults.page === 0}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                            Trước
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setSearchPageRequest((prev) => ({ ...prev, page: prev.page + 1 }))
                            }
                            disabled={searchResults.page >= searchResults.totalPages - 1}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Hủy
                </button>
                {selectedExerciseIds.length > 0 && (
                    <button
                        type="button"
                        onClick={handleConfirmSelection}
                        disabled={isSaving}
                        className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <svg
                                    className="animate-spin h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Đang lưu...
                            </>
                        ) : (
                            `Xác nhận (${selectedExerciseIds.length})`
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

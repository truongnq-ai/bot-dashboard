/**
 * Exercise Set Exercise Manager Component - Admin Dashboard
 * Manages exercises in an exercise set with ordering, add/remove, and validation
 */

'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ExerciseListItemWithContent } from '@/types/exercise';
import { useExercisesBatch } from '@/lib/hooks/useExercisesBatch';
import { useExerciseSetExercises } from '@/lib/hooks/useExerciseSets';
import { ExerciseStatus } from '@/types/exercise';
import { getDifficultyLabel } from '@/lib/utils/formatters';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { useReferenceData } from '@/context/ReferenceDataContext';

interface ExerciseSetExerciseManagerProps {
    exerciseIds: string[];
    onChange: (exerciseIds: string[]) => void;
    initialSubjectId?: string;
    exerciseSetId?: string;
    initialExerciseIds?: string[];
}

export default function ExerciseSetExerciseManager({
    exerciseIds,
    onChange,
    initialSubjectId,
    exerciseSetId,
    initialExerciseIds = [],
}: ExerciseSetExerciseManagerProps) {
    const router = useRouter();
    const { getTopicName } = useReferenceData();

    // Logic to decide which API to use for "Đã chọn" list
    const shouldUseExerciseSetApi = useMemo(() => {
        if (!exerciseSetId || !initialExerciseIds || initialExerciseIds.length === 0) {
            return false;
        }
        // Check if exerciseIds match initialExerciseIds (no changes)
        if (exerciseIds.length !== initialExerciseIds.length) {
            return false;
        }
        const sortedCurrent = [...exerciseIds].sort().join(',');
        const sortedInitial = [...initialExerciseIds].sort().join(',');
        return sortedCurrent === sortedInitial;
    }, [exerciseSetId, exerciseIds, initialExerciseIds]);

    // Fetch exercises for "Đã chọn" list
    const { data: exerciseSetExercises, loading: loadingExerciseSetExercises } =
        useExerciseSetExercises(shouldUseExerciseSetApi ? (exerciseSetId ?? null) : null);
    const { data: batchExercises, loading: loadingBatchExercises } = useExercisesBatch(
        shouldUseExerciseSetApi ? [] : exerciseIds
    );

    // Combine data from both sources
    const selectedExercises = useMemo(() => {
        if (shouldUseExerciseSetApi && exerciseSetExercises) {
            // Convert ExerciseSetItem to ExerciseListItemWithContent format
            return exerciseSetExercises.map((item) => ({
                id: item.exerciseId,
                teacherId: '', // Not needed for display
                subjectId: item.exerciseSubjectId,
                topicId: item.exerciseTopicId,
                contentLatex: item.exerciseContentLatex,
                content: item.exerciseContent,
                difficulty: item.exerciseDifficulty,
                type: undefined,
                status: ExerciseStatus.APPROVED, // Assume approved
                createdBy: '',
                createdAt: '',
                updatedAt: '',
            }));
        } else if (!shouldUseExerciseSetApi && batchExercises) {
            // Ensure order matches exerciseIds
            const exerciseMap = new Map(batchExercises.map((e) => [e.id, e]));
            return exerciseIds.map((id) => exerciseMap.get(id)).filter((e) => e !== undefined) as ExerciseListItemWithContent[];
        }
        return [];
    }, [shouldUseExerciseSetApi, exerciseSetExercises, batchExercises, exerciseIds]);

    const loadingSelectedExercises = shouldUseExerciseSetApi
        ? loadingExerciseSetExercises
        : loadingBatchExercises;

    const handleRemove = (exerciseId: string) => {
        onChange(exerciseIds.filter((id) => id !== exerciseId));
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const newIds = [...exerciseIds];
        [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
        onChange(newIds);
    };

    const handleMoveDown = (index: number) => {
        if (index === exerciseIds.length - 1) return;
        const newIds = [...exerciseIds];
        [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
        onChange(newIds);
    };

    const handleAddExercises = () => {
        // If we have an ID, we can use the selection page
        // If creating new, we might need a modal or distinct selection flow.
        // For now, mirroring teacher flow which likely relies on session storage or query params
        // BUT teacher flow uses `/exercise-sets/${id}/edit/exercises` which assumes ID exists.
        // Admin dashboard create flow might need adjustment.

        // TEMPORARY SOLUTION:
        // If no ID (create mode), we currently don't have a direct "add from list" UI in this component.
        // Teacher dashboard likely has a separate step or modal.
        // Let's check how teacher dashboard handles "Add Exercises" in Create mode.
        // Looking at teacher code, it seems `ExerciseSetExerciseManager` is used inside `ExerciseSetForm`.
        // The `handleAddExercises` function pushes to `/exercise-sets/${id}/edit/exercises`.
        // This implies that in Create mode (no ID), this button might be disabled or handle differently?
        // In teacher code: `disabled={!exerciseSetId}`.
        // So in ID-less Create mode, user CANNOT add exercises via this button?
        // Correct, usually one creates the Set first, then adds exercises?
        // OR, there's another mechanism.
        // Teacher code shows: `disabled={!exerciseSetId}` on the button.
        // Meaning: You must save the basic info (Create) first, to get an ID, THEN add exercises.
        // This seems to be the flow.

        if (!exerciseSetId) {
            return;
        }
        const currentPath = window.location.pathname + window.location.search;
        router.push(
            `/exercise-sets/${exerciseSetId}/edit/exercises?from=${encodeURIComponent(currentPath)}`
        );
    };

    return (
        <div className="space-y-4">
            {/* Current Exercises List */}
            <div>
                {exerciseIds.length === 0 ? (
                    <EmptyState
                        title="Chưa có bài tập nào"
                        message="Nhấn 'Thêm bài tập' để thêm bài tập vào đề."
                    />
                ) : loadingSelectedExercises ? (
                    <LoadingState message="Đang tải danh sách bài tập..." />
                ) : (
                    <div className="space-y-2">
                        {selectedExercises.map((exercise, index) => (
                            <div
                                key={exercise.id}
                                className="flex items-start justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                            >
                                <div className="flex items-start gap-3 flex-1">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-8 flex-shrink-0">
                                        {index + 1}.
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Topic: {getTopicName(exercise.topicId || '') || exercise.topicId || '-'}
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
                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                    <button
                                        type="button"
                                        onClick={() => handleMoveUp(index)}
                                        disabled={index === 0}
                                        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleMoveDown(index)}
                                        disabled={index === exerciseIds.length - 1}
                                        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(exercise.id)}
                                        className="px-2 py-1 text-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/30"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Button */}
            <button
                type="button"
                onClick={handleAddExercises}
                disabled={!exerciseSetId}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {exerciseSetId ? '+ Thêm bài tập' : 'Lưu đề bài trước để thêm bài tập'}
            </button>
        </div>
    );
}

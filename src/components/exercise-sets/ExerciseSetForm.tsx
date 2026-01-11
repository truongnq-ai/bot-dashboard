/**
 * Exercise Set Form Component - Admin Dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    ExerciseSet,
    CreateExerciseSetRequest,
    UpdateExerciseSetRequest,
    ExerciseSetIntent,
} from '@/types/exercise-set';
import ExerciseSetExerciseManager from './ExerciseSetExerciseManager';

interface ExerciseSetFormProps {
    exerciseSet?: ExerciseSet | null;
    onSubmit: (data: CreateExerciseSetRequest | UpdateExerciseSetRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function ExerciseSetForm({
    exerciseSet,
    onSubmit,
    onCancel,
    isLoading = false,
}: ExerciseSetFormProps) {
    const [title, setTitle] = useState<string>(exerciseSet?.title || '');
    const [description, setDescription] = useState<string>(exerciseSet?.description || '');
    const [intent, setIntent] = useState<ExerciseSetIntent>(
        exerciseSet?.intent || ExerciseSetIntent.PRACTICE
    );
    const [noteForTeacher, setNoteForTeacher] = useState<string>(exerciseSet?.noteForTeacher || '');
    const [exerciseIds, setExerciseIds] = useState<string[]>(
        exerciseSet?.exercises.map((e) => e.exerciseId) || []
    );
    const [initialExerciseIds, setInitialExerciseIds] = useState<string[]>(
        exerciseSet?.exercises.map((e) => e.exerciseId) || []
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Update initialExerciseIds when exerciseSet changes
    useEffect(() => {
        if (exerciseSet) {
            const ids = exerciseSet.exercises.map((e) => e.exerciseId);
            setInitialExerciseIds(ids);
            setExerciseIds(ids);
        } else {
            setInitialExerciseIds([]);
            setExerciseIds([]);
        }
    }, [exerciseSet]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = 'Vui lòng nhập tiêu đề';
        }

        // Allow creating empty set first?
        // Teacher form required exercises: `if (exerciseIds.length === 0) newErrors.exercises = ...`
        // usage in Create mode: Button disabled if no ID.
        // So user creates set (exercises empty) -> Backend creates set -> User redirected to Edit -> User adds exercises.
        // Therefore, validation should NOT fail if exercises empty on CREATE (if backend allows it).
        // Reviewing teacher code again:
        // It seems teacher code REQUIRES exercises: `if (exerciseIds.length === 0) ...`
        // BUT the "Add" button is disabled if `!exerciseSetId`.
        // This creates a circular dependency if API requires exercises to create.
        // Let's assume for now we allow empty exercises on Create if ID is missing.
        // OR the flow is different.

        // Actually, in `tutor-teacher`, the Create flow might be different.
        // Let's stick to the cloned code logic but relax `exercises` check if it's a new creation and we can't add exercises yet.
        if (!exerciseSet && exerciseIds.length === 0) {
            // We can't add exercises until we have an ID (per UI button disabled state).
            // So we must allow empty exercises for CREATE.
        } else if (exerciseIds.length === 0) {
            // On Edit, allow empty? Or enforce? Teacher code enforced it.
            newErrors.exercises = 'Vui lòng chọn ít nhất một bài tập';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        if (exerciseSet) {
            // Update
            const updateData: UpdateExerciseSetRequest = {};
            if (title !== exerciseSet.title) updateData.title = title;
            if (description !== exerciseSet.description) updateData.description = description || undefined;
            if (intent !== exerciseSet.intent) updateData.intent = intent;
            if (noteForTeacher !== exerciseSet.noteForTeacher)
                updateData.noteForTeacher = noteForTeacher || undefined;

            const currentExerciseIds = exerciseSet.exercises.map((e) => e.exerciseId);
            const exerciseIdsChanged =
                exerciseIds.length !== currentExerciseIds.length ||
                !exerciseIds.every((id) => currentExerciseIds.includes(id));
            if (exerciseIdsChanged) {
                updateData.exerciseIds = exerciseIds;
            }

            await onSubmit(updateData);
        } else {
            // Create
            const createData: CreateExerciseSetRequest = {
                title,
                description: description || undefined,
                intent,
                noteForTeacher: noteForTeacher || undefined,
                exerciseIds,
            };
            await onSubmit(createData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.title
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề đề bài..."
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mô tả
                </label>
                <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập mô tả đề bài..."
                />
            </div>

            {/* Intent */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mục đích <span className="text-red-500">*</span>
                </label>
                <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={intent}
                    onChange={(e) => setIntent(e.target.value as ExerciseSetIntent)}
                >
                    <option value={ExerciseSetIntent.PRACTICE}>Luyện tập</option>
                    <option value={ExerciseSetIntent.REVIEW}>Ôn tập</option>
                    <option value={ExerciseSetIntent.SURVEY}>Khảo sát</option>
                    <option value={ExerciseSetIntent.TEST}>Kiểm tra</option>
                </select>
            </div>

            {/* Note for Teacher */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ghi chú cho giáo viên
                </label>
                <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    value={noteForTeacher}
                    onChange={(e) => setNoteForTeacher(e.target.value)}
                    placeholder="Nhập ghi chú..."
                />
            </div>

            {/* Exercise Manager */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Danh sách bài tập {exerciseSet && <span className="text-red-500">*</span>}
                </label>
                <ExerciseSetExerciseManager
                    exerciseIds={exerciseIds}
                    onChange={setExerciseIds}
                    initialSubjectId={exerciseSet?.exercises[0]?.exerciseSubjectId}
                    exerciseSetId={exerciseSet?.id}
                    initialExerciseIds={initialExerciseIds}
                />
                {errors.exercises && <p className="mt-1 text-sm text-red-500">{errors.exercises}</p>}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
                >
                    {isLoading ? 'Đang lưu...' : exerciseSet ? 'Cập nhật' : 'Tạo mới'}
                </button>
            </div>
        </form>
    );
}

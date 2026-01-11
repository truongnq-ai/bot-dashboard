/**
 * Exercise Form Component - Admin Dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Exercise, CreateExerciseRequest, UpdateExerciseRequest, ExerciseType, CommonMistake } from '@/types/exercise';
import { useSubjects } from '@/lib/hooks/useSubjects';
import { useTopics } from '@/lib/hooks/useTopics';
import TopicTreeSelect from '@/components/form/TreeSelect';
import { getExerciseTypeOptions } from '@/lib/utils/formatters';

interface ExerciseFormProps {
    exercise?: Exercise | null;
    onSubmit: (data: CreateExerciseRequest | UpdateExerciseRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function ExerciseForm({
    exercise,
    onSubmit,
    onCancel,
    isLoading = false,
}: ExerciseFormProps) {
    const [subjectId, setSubjectId] = useState<string>(exercise?.subjectId || '');
    const [topicId, setTopicId] = useState<string>(exercise?.topicId || '');
    const [contentLatex, setContentLatex] = useState<string>(exercise?.contentLatex || '');
    const [difficulty, setDifficulty] = useState<number | undefined>(exercise?.difficulty);
    const [type, setType] = useState<ExerciseType | undefined>(exercise?.type);
    const [solutionDraft, setSolutionDraft] = useState<string>(exercise?.solutionDraft || '');
    const [learningObjective, setLearningObjective] = useState<string>(exercise?.learningObjective || '');
    const [commonMistakes, setCommonMistakes] = useState<CommonMistake[]>(exercise?.commonMistakes || []);
    const [hints, setHints] = useState<string[]>(exercise?.hints || []);
    const [timeEstimateSec, setTimeEstimateSec] = useState<number | undefined>(exercise?.timeEstimateSec);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { data: subjects } = useSubjects();
    // Fetch topics only if subjectId is selected
    const { data: topics } = useTopics(subjectId ? { subjectId } : {});

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Nhập nội dung bài tập (HTML)...',
            }),
        ],
        content: exercise?.content || '',
        immediatelyRender: false,
    });

    const solutionDraftEditor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Nhập hướng dẫn giải (HTML)...',
            }),
        ],
        content: exercise?.solutionDraft || '',
        immediatelyRender: false,
    });

    // Update form fields when exercise prop changes (for copy mode)
    useEffect(() => {
        if (exercise && !exercise.id) {
            // Only update if in create/copy mode (no id)
            setSubjectId(exercise.subjectId || '');
            setTopicId(exercise.topicId || '');
            setContentLatex(exercise.contentLatex || '');
            setDifficulty(exercise.difficulty);
            setType(exercise.type);
            setSolutionDraft(exercise.solutionDraft || '');
            setLearningObjective(exercise.learningObjective || '');
            setCommonMistakes(exercise.commonMistakes || []);
            setHints(exercise.hints || []);
            setTimeEstimateSec(exercise.timeEstimateSec);
        }
    }, [exercise]);

    // Update editor when exercise changes
    useEffect(() => {
        if (editor && exercise?.content && exercise.content !== editor.getHTML()) {
            editor.commands.setContent(exercise.content);
        }
    }, [exercise?.content, editor]);

    // Update solutionDraft editor when exercise changes
    useEffect(() => {
        if (solutionDraftEditor && exercise?.solutionDraft && exercise.solutionDraft !== solutionDraftEditor.getHTML()) {
            solutionDraftEditor.commands.setContent(exercise.solutionDraft);
        }
    }, [exercise?.solutionDraft, solutionDraftEditor]);

    // Reset topic when subject changes
    useEffect(() => {
        if (!subjectId) {
            setTopicId('');
        }
    }, [subjectId]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!subjectId) {
            newErrors.subjectId = 'Vui lòng chọn môn học';
        }

        if (!topicId) {
            newErrors.topicId = 'Vui lòng chọn chủ đề';
        }

        if (!editor || !editor.getHTML() || editor.getText().trim().length === 0) {
            newErrors.content = 'Vui lòng nhập nội dung bài tập';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const addCommonMistake = () => {
        setCommonMistakes([...commonMistakes, { mistake: '', explanation: '' }]);
    };

    const removeCommonMistake = (index: number) => {
        setCommonMistakes(commonMistakes.filter((_, i) => i !== index));
    };

    const updateCommonMistake = (index: number, field: 'mistake' | 'explanation', value: string) => {
        const updated = [...commonMistakes];
        // @ts-ignore
        updated[index] = { ...updated[index], [field]: value };
        setCommonMistakes(updated);
    };

    const addHint = () => {
        setHints([...hints, '']);
    };

    const removeHint = (index: number) => {
        setHints(hints.filter((_, i) => i !== index));
    };

    const updateHint = (index: number, value: string) => {
        const updated = [...hints];
        updated[index] = value;
        setHints(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const content = editor?.getHTML() || '';
        const solutionDraftContent = solutionDraftEditor?.getHTML() || '';

        if (exercise?.id) {
            // Update (chỉ khi có id)
            const updateData: UpdateExerciseRequest = {};
            if (subjectId !== exercise.subjectId) updateData.subjectId = subjectId;
            if (topicId !== exercise.topicId) updateData.topicId = topicId;
            if (content !== exercise.content) updateData.content = content;
            if (contentLatex !== exercise.contentLatex) updateData.contentLatex = contentLatex || undefined;
            if (difficulty !== exercise.difficulty) updateData.difficulty = difficulty;
            if (type !== exercise.type) updateData.type = type;
            if (solutionDraftContent !== exercise.solutionDraft) updateData.solutionDraft = solutionDraftContent || undefined;
            if (learningObjective !== exercise.learningObjective) updateData.learningObjective = learningObjective || undefined;
            if (JSON.stringify(commonMistakes) !== JSON.stringify(exercise.commonMistakes)) updateData.commonMistakes = commonMistakes.length > 0 ? commonMistakes : undefined;
            if (JSON.stringify(hints) !== JSON.stringify(exercise.hints)) updateData.hints = hints.length > 0 ? hints : undefined;
            if (timeEstimateSec !== exercise.timeEstimateSec) updateData.timeEstimateSec = timeEstimateSec;

            await onSubmit(updateData);
        } else {
            // Create (bao gồm cả copy mode - có data nhưng không có id)
            const createData: CreateExerciseRequest = {
                subjectId,
                topicId,
                content,
                contentLatex: contentLatex || undefined,
                difficulty,
                type,
                solutionDraft: solutionDraftContent || undefined,
                learningObjective: learningObjective || undefined,
                commonMistakes: commonMistakes.length > 0 ? commonMistakes : undefined,
                hints: hints.length > 0 ? hints : undefined,
                timeEstimateSec: timeEstimateSec,
            };

            await onSubmit(createData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div>
                <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Môn học <span className="text-error-500">*</span>
                </label>
                <select
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.subjectId ? 'border-error-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                    value={subjectId}
                    onChange={(e) => {
                        setSubjectId(e.target.value);
                        setTopicId(''); // Reset topic
                        setErrors((prev) => ({ ...prev, subjectId: '' }));
                    }}
                    disabled={isLoading}
                >
                    <option value="">Chọn môn học</option>
                    {subjects?.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                            {subject.name}
                        </option>
                    ))}
                </select>
                {errors.subjectId && <p className="mt-1 text-theme-sm text-error-500">{errors.subjectId}</p>}
            </div>

            {/* Topic */}
            <div>
                <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chủ đề <span className="text-error-500">*</span>
                </label>
                <TopicTreeSelect
                    value={topicId}
                    onChange={(value) => {
                        setTopicId(value || '');
                        setErrors((prev) => ({ ...prev, topicId: '' }));
                    }}
                    treeData={topics || []}
                    placeholder={
                        !subjectId
                            ? 'Chọn môn học trước'
                            : !topics || topics.length === 0
                                ? 'Không có chủ đề'
                                : 'Chọn chủ đề'
                    }
                    disabled={isLoading || !subjectId}
                    error={!!errors.topicId}
                />
                {errors.topicId && <p className="mt-1 text-theme-sm text-error-500">{errors.topicId}</p>}
            </div>

            {/* Content (Rich Text Editor) */}
            <div>
                <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nội dung bài tập <span className="text-error-500">*</span>
                </label>
                <div
                    className={`border rounded-lg ${errors.content ? 'border-error-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                >
                    <EditorContent
                        editor={editor}
                        className="prose max-w-none min-h-[300px] p-4 focus:outline-none"
                    />
                </div>
                {errors.content && <p className="mt-1 text-theme-sm text-error-500">{errors.content}</p>}
            </div>

            {/* Content LaTeX */}
            <div>
                <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nội dung LaTeX (tùy chọn)
                </label>
                <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={4}
                    value={contentLatex}
                    onChange={(e) => setContentLatex(e.target.value)}
                    disabled={isLoading}
                    placeholder="Nhập nội dung LaTeX..."
                />
            </div>

            {/* Exercise Type */}
            <div>
                <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Loại bài tập (tùy chọn)
                </label>
                <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={type || ''}
                    onChange={(e) => setType(e.target.value ? (e.target.value as ExerciseType) : undefined)}
                    disabled={isLoading}
                >
                    <option value="">Chọn loại bài tập</option>
                    {getExerciseTypeOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Difficulty */}
            <div>
                <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Độ khó (tùy chọn)
                </label>
                <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={difficulty || ''}
                    onChange={(e) => setDifficulty(e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={isLoading}
                >
                    <option value="">Chọn độ khó</option>
                    <option value="1">1 - Rất dễ</option>
                    <option value="2">2 - Dễ</option>
                    <option value="3">3 - Trung bình</option>
                    <option value="4">4 - Khó</option>
                    <option value="5">5 - Rất khó</option>
                </select>
            </div>

            {/* Solution Draft */}
            <div>
                <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hướng dẫn giải (nháp) (tùy chọn)
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg">
                    <EditorContent
                        editor={solutionDraftEditor}
                        className="prose max-w-none min-h-[300px] p-4 focus:outline-none"
                    />
                </div>
            </div>

            {/* Learning Objective */}
            <div>
                <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mục tiêu học tập (tùy chọn)
                </label>
                <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={4}
                    value={learningObjective}
                    onChange={(e) => setLearningObjective(e.target.value)}
                    disabled={isLoading}
                    placeholder="Nhập mục tiêu học tập..."
                />
            </div>

            {/* Common Mistakes */}
            <div>
                <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lỗi thường gặp (tùy chọn)
                </label>
                <div className="space-y-3">
                    {commonMistakes.map((mistake, index) => (
                        <div key={index} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Lỗi sai
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        value={mistake.mistake}
                                        onChange={(e) => updateCommonMistake(index, 'mistake', e.target.value)}
                                        disabled={isLoading}
                                        placeholder="Mô tả lỗi sai..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Giải thích (tùy chọn)
                                    </label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        rows={2}
                                        value={mistake.explanation || ''}
                                        onChange={(e) => updateCommonMistake(index, 'explanation', e.target.value)}
                                        disabled={isLoading}
                                        placeholder="Giải thích lỗi sai..."
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeCommonMistake(index)}
                                    disabled={isLoading}
                                    className="px-3 py-1 text-theme-sm bg-error-100 dark:bg-error-900/20 text-error-700 dark:text-error-400 rounded hover:bg-error-200 dark:hover:bg-error-900/30 disabled:opacity-50"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addCommonMistake}
                        disabled={isLoading}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                    >
                        + Thêm lỗi thường gặp
                    </button>
                </div>
            </div>

            {/* Hints */}
            <div>
                <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gợi ý (tùy chọn)
                </label>
                <div className="space-y-3">
                    {hints.map((hint, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <textarea
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                rows={2}
                                value={hint}
                                onChange={(e) => updateHint(index, e.target.value)}
                                disabled={isLoading}
                                placeholder="Nhập gợi ý..."
                            />
                            <button
                                type="button"
                                onClick={() => removeHint(index)}
                                disabled={isLoading}
                                className="px-3 py-2 text-theme-sm bg-error-100 dark:bg-error-900/20 text-error-700 dark:text-error-400 rounded hover:bg-error-200 dark:hover:bg-error-900/30 disabled:opacity-50"
                            >
                                Xóa
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addHint}
                        disabled={isLoading}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                    >
                        + Thêm gợi ý
                    </button>
                </div>
            </div>

            {/* Time Estimate */}
            <div>
                <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Thời gian ước tính (giây) (tùy chọn)
                </label>
                <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={timeEstimateSec || ''}
                    onChange={(e) => setTimeEstimateSec(e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={isLoading}
                    placeholder="Nhập thời gian ước tính (giây)..."
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
                >
                    {isLoading ? 'Đang lưu...' : exercise?.id ? 'Cập nhật' : 'Tạo mới'}
                </button>
            </div>
        </form>
    );
}

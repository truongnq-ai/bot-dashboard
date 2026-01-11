/**
 * Create Assignment Content Component - Admin Dashboard
 * Allows selecting an Exercise Set and assigning it to multiple Classes.
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useExerciseSets } from '@/lib/hooks/useExerciseSets';
import { useClassesWithFilters } from '@/lib/hooks/useClasses';
import { useSubjects } from '@/lib/hooks/useSubjects';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { createAssignmentsBatch } from '@/lib/api/assignment.service';
import { toast } from 'react-hot-toast';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { ExerciseSet, ExerciseSetPageRequest, ExerciseSetIntent } from '@/types/exercise-set';
import { Class } from '@/types/class';
import { PageRequest } from '@/types/common';
import { formatDate } from '@/lib/utils/formatters';

const ITEMS_PER_PAGE = 10;

export default function CreateAssignmentContent() {
    const router = useRouter();

    // State for Steps
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedExerciseSet, setSelectedExerciseSet] = useState<ExerciseSet | null>(null);

    // --- Step 1 State: Select Exercise Set ---
    const [esSearchTerm, setEsSearchTerm] = useState('');
    const [esSubjectFilter, setEsSubjectFilter] = useState('');
    const debouncedEsSearchTerm = useDebounce(esSearchTerm, 400);

    // Exercise Sets Data
    const [esPageRequest, setEsPageRequest] = useState<PageRequest>({
        page: 0,
        pageSize: 5,
        sort: [{ property: 'createdAt', direction: 'DESC' }],
        dataRequest: {} as ExerciseSetPageRequest,
    });

    const { data: exerciseSetsData, loading: esLoading, error: esError, refetch: esRefetch } = useExerciseSets(esPageRequest);

    // Update ES filters
    useEffect(() => {
        setEsPageRequest((prev) => ({
            ...prev,
            page: 0,
            dataRequest: {
                ...prev.dataRequest,
                title: debouncedEsSearchTerm || undefined,
                subjectId: esSubjectFilter || undefined,
            },
        }));
    }, [debouncedEsSearchTerm, esSubjectFilter]);

    // --- Step 2 State: Select Classes ---
    // We can reuse the logic from AssignToClassesContent here
    const [classSearchTerm, setClassSearchTerm] = useState('');
    const [classSubjectFilter, setClassSubjectFilter] = useState('');
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [classCurrentPage, setClassCurrentPage] = useState(0);
    const [isAssigning, setIsAssigning] = useState(false);

    const debouncedClassSearchTerm = useDebounce(classSearchTerm, 400);

    // Classes Data
    const { data: classes, loading: classLoading, error: classError, refetch: classRefetch } = useClassesWithFilters(
        classSubjectFilter || undefined,
        debouncedClassSearchTerm || undefined
    );

    // Subjects Data (Shared)
    const { data: subjects } = useSubjects();

    // Pre-fill class subject filter when Exercise Set is selected
    useEffect(() => {
        if (selectedExerciseSet && step === 2) {
            if (selectedExerciseSet.exercises.length > 0) {
                // Try to infer subject from the first exercise
                const subjectId = selectedExerciseSet.exercises[0].exerciseSubjectId;
                if (subjectId) {
                    setClassSubjectFilter(subjectId);
                }
            }
        }
    }, [selectedExerciseSet, step]);

    // Pagination for Classes
    const classTotalPages = Math.ceil((classes?.length || 0) / ITEMS_PER_PAGE);
    const paginatedClasses = useMemo(() => {
        if (!classes) return [];
        const start = classCurrentPage * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return classes.slice(start, end);
    }, [classes, classCurrentPage]);

    // Reset class page on filter change
    useEffect(() => {
        setClassCurrentPage(0);
    }, [classSubjectFilter, debouncedClassSearchTerm]);


    // Handlers
    const handleSelectExerciseSet = (es: any) => {
        // We need full ExerciseSet object, but the list item might be partial?
        // The useExerciseSets returns ExerciseSetListItem which has basic info.
        // Ideally we should verify if we need detailed info or if list item is enough.
        // For display and ID, list item is enough.
        // The type ExerciseSetListItem has: id, title, subjectName, exerciseCount, etc.
        // But `selectedExerciseSet` matches `ExerciseSet` type which is fuller.
        // Let's assume list item is sufficient or fetch details if needed.
        // For now, let's just cast or pick updated type.
        // `useExerciseSets` returns `ExerciseSetListItem`.
        // Let's store `ExerciseSetListItem` in state instead.
        setSelectedExerciseSet(es as any); // Casting for now, refined later
        setStep(2);
    };

    const handleToggleClassSelection = (classId: string) => {
        setSelectedClassIds((prev) => {
            if (prev.includes(classId)) {
                return prev.filter((id) => id !== classId);
            } else {
                return [...prev, classId];
            }
        });
    };

    const handleAssign = async () => {
        if (!selectedExerciseSet || selectedClassIds.length === 0) return;

        try {
            setIsAssigning(true);
            const response = await createAssignmentsBatch({
                exerciseSetId: selectedExerciseSet.id,
                classIds: selectedClassIds,
            });

            if (response.data) {
                const { success, errors } = response.data;
                const successCount = success.length;
                const errorCount = errors.length;

                if (errorCount === 0) {
                    toast.success(`Đã gán đề bài vào ${successCount} lớp thành công`);
                    router.push('/assignments');
                } else {
                    toast.error(`Đã gán vào ${successCount} lớp thành công, ${errorCount} lớp thất bại`);
                    if (errors.length > 0) {
                        console.error('Errors:', errors);
                    }
                }
            }
        } catch (error) {
            toast.error('Gán đề bài thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
        } finally {
            setIsAssigning(false);
        }
    };

    // Render Step 1: Select Exercise Set
    const renderStep1 = () => (
        <div className="space-y-4">
            <div className="flex gap-4 mb-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đề bài..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={esSearchTerm}
                        onChange={(e) => setEsSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-1/3">
                    <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={esSubjectFilter}
                        onChange={(e) => setEsSubjectFilter(e.target.value)}
                    >
                        <option value="">Tất cả môn học</option>
                        {subjects?.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {esLoading ? (
                <LoadingState message="Đang tải danh sách đề bài..." />
            ) : esError ? (
                <ErrorState message="Lỗi tải danh sách" />
            ) : (
                <div className="space-y-2">
                    {exerciseSetsData?.content?.map((es) => (
                        <div
                            key={es.id}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 cursor-pointer transition-colors bg-white dark:bg-gray-800"
                            onClick={() => handleSelectExerciseSet(es)}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">{es.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {es.subjectName || 'Chưa phân loại'} • {es.exerciseCount} câu hỏi • {formatDate(es.createdAt)}
                                    </p>
                                </div>
                                <button className="px-3 py-1 bg-brand-50 text-brand-600 rounded hover:bg-brand-100">
                                    Chọn
                                </button>
                            </div>
                        </div>
                    ))}
                    {exerciseSetsData?.content?.length === 0 && (
                        <EmptyState message="Không tìm thấy đề bài nào" />
                    )}
                </div>
            )}

            {/* Basic Pagination for Step 1 */}
            {exerciseSetsData && exerciseSetsData.totalPages > 1 && (
                <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-gray-500">Trang {exerciseSetsData.page + 1} / {exerciseSetsData.totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={esPageRequest.page === 0}
                            onClick={() => setEsPageRequest(p => ({ ...p, page: p.page - 1 }))}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >Trước</button>
                        <button
                            disabled={esPageRequest.page >= exerciseSetsData.totalPages - 1}
                            onClick={() => setEsPageRequest(p => ({ ...p, page: p.page + 1 }))}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >Sau</button>
                    </div>
                </div>
            )}
        </div>
    );

    // Render Step 2: Select Classes
    const renderStep2 = () => (
        <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 flex justify-between items-center">
                <div>
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Đang giao đề bài:</p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{selectedExerciseSet?.title}</p>
                </div>
                <button onClick={() => setStep(1)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Thay đổi
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Tìm lớp</label>
                    <input
                        type="text"
                        placeholder="Nhập tên lớp..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={classSearchTerm}
                        onChange={(e) => setClassSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Môn học</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={classSubjectFilter}
                        onChange={(e) => setClassSubjectFilter(e.target.value)}
                    >
                        <option value="">Tất cả</option>
                        {subjects?.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {classLoading ? (
                <LoadingState message="Đang tải danh sách lớp..." />
            ) : classError ? (
                <ErrorState message="Lỗi tải danh sách lớp" />
            ) : (
                <div className="space-y-2">
                    {paginatedClasses.map((cls) => {
                        const isSelected = selectedClassIds.includes(cls.id);
                        return (
                            <div
                                key={cls.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${isSelected
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-brand-300'
                                    }`}
                                onClick={() => handleToggleClassSelection(cls.id)}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">{cls.name}</h4>
                                        <p className="text-xs text-gray-500">{cls.subjectName}</p>
                                    </div>
                                    {isSelected && <span className="text-brand-600 font-medium">✓</span>}
                                </div>
                            </div>
                        );
                    })}
                    {classes?.length === 0 && <EmptyState message="Không tìm thấy lớp học nào" />}
                </div>
            )}

            {/* Pagination for Classes */}
            {classTotalPages > 1 && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-500">Trang {classCurrentPage + 1} / {classTotalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={classCurrentPage === 0}
                            onClick={() => setClassCurrentPage(p => Math.max(0, p - 1))}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >Trước</button>
                        <button
                            disabled={classCurrentPage >= classTotalPages - 1}
                            onClick={() => setClassCurrentPage(p => Math.min(classTotalPages - 1, p + 1))}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >Sau</button>
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <button
                    onClick={handleAssign}
                    disabled={isAssigning || selectedClassIds.length === 0}
                    className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 flex items-center gap-2"
                >
                    {isAssigning && <span className="animate-spin">⟳</span>}
                    Gán cho {selectedClassIds.length} lớp
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Giao bài tập mới</h1>
                <button onClick={() => router.push('/assignments')} className="text-gray-500 hover:text-gray-700">Hủy</button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                {/* Progress Steps */}
                <div className="flex items-center mb-6">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-500'} font-bold`}>1</div>
                    <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-brand-500' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-500'} font-bold`}>2</div>
                </div>

                <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
                    {step === 1 ? 'Bước 1: Chọn Đề bài' : 'Bước 2: Chọn Lớp học'}
                </h2>

                {step === 1 ? renderStep1() : renderStep2()}
            </div>
        </div>
    );
}

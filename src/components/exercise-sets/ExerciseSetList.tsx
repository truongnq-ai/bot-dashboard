/**
 * Exercise Set List Component - Admin Dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useExerciseSets } from '@/lib/hooks/useExerciseSets';
import { ExerciseSetPageRequest, ExerciseSetIntent } from '@/types/exercise-set';
import { PageRequest } from '@/types/common';
import ExerciseSetListTable from './ExerciseSetListTable';
import { useSubjects } from '@/lib/hooks/useSubjects';
import { useSearchOptimization } from '@/lib/hooks/useSearchOptimization';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

export default function ExerciseSetList() {
    const router = useRouter();
    const [pageRequest, setPageRequest] = useState<PageRequest>({
        page: 0,
        pageSize: 10,
        dataRequest: {} as ExerciseSetPageRequest,
    });

    const { data, loading, error, refetch } = useExerciseSets(pageRequest);
    const { data: subjects } = useSubjects();

    const {
        input: titleInput,
        setInput: setTitleInput,
        debouncedValue: debouncedTitle,
    } = useSearchOptimization({
        initialValue: pageRequest.dataRequest?.title,
        minLength: 3,
    });

    useEffect(() => {
        if (debouncedTitle !== pageRequest.dataRequest?.title) {
            const t = setTimeout(() => {
                setPageRequest((prev) => ({
                    ...prev,
                    page: 0,
                    dataRequest: { ...prev.dataRequest, title: debouncedTitle },
                }));
            }, 0);
            return () => clearTimeout(t);
        }
    }, [debouncedTitle, pageRequest.dataRequest?.title]);

    const handleFilterChange = (newFilters: Partial<ExerciseSetPageRequest>) => {
        setPageRequest((prev) => ({
            ...prev,
            page: 0, // Reset to first page on filter change
            dataRequest: { ...prev.dataRequest, ...newFilters },
        }));
    };

    const handlePageChange = (page: number) => {
        setPageRequest((prev) => ({ ...prev, page }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPageRequest((prev) => ({ ...prev, pageSize, page: 0 }));
    };

    const handleCreate = () => {
        router.push('/exercise-sets/create');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Quản lý đề bài</h1>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                >
                    + Thêm mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Môn học
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            value={pageRequest.dataRequest?.subjectId || ''}
                            onChange={(e) =>
                                handleFilterChange({
                                    subjectId: e.target.value || undefined,
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
                            Mục đích
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            value={pageRequest.dataRequest?.intent || ''}
                            onChange={(e) =>
                                handleFilterChange({ intent: (e.target.value as ExerciseSetIntent) || undefined })
                            }
                        >
                            <option value="">Tất cả</option>
                            <option value={ExerciseSetIntent.PRACTICE}>Luyện tập</option>
                            <option value={ExerciseSetIntent.REVIEW}>Ôn tập</option>
                            <option value={ExerciseSetIntent.SURVEY}>Khảo sát</option>
                            <option value={ExerciseSetIntent.TEST}>Kiểm tra</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tìm kiếm theo tiêu đề
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            placeholder="Nhập tiêu đề..."
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && <LoadingState message="Đang tải..." />}

            {/* Error State */}
            {error && !loading && (
                <ErrorState
                    message={error.message || 'Có lỗi xảy ra khi tải danh sách đề bài'}
                    action={{
                        label: 'Thử lại',
                        onClick: () => refetch(),
                    }}
                />
            )}

            {/* Table */}
            {!loading && !error && data && (
                <ExerciseSetListTable
                    exerciseSets={data.content || []}
                    onDelete={refetch}
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

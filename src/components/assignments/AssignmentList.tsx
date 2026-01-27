/**
 * Assignment List Component - Admin Dashboard
 */

'use client';

import React, { useState } from 'react';
import { useAssignments } from '@/lib/hooks/useAssignments';
import { AssignmentPageRequest } from '@/types/assignment';
import { PageRequest } from '@/types/common';
import AssignmentListTable from './AssignmentListTable';
import { useSubjects } from '@/lib/hooks/useSubjects';
import { useClassesWithFilters } from '@/lib/hooks/useClasses';
import { useSearchOptimization } from '@/lib/hooks/useSearchOptimization';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import { useRouter } from 'next/navigation';

export default function AssignmentList() {
    const router = useRouter();
    const [pageRequest, setPageRequest] = useState<PageRequest>({
        page: 0,
        pageSize: 10,
        sort: [{ property: 'assignedAt', direction: 'DESC' }], // Default sort: newest first
        dataRequest: {} as AssignmentPageRequest,
    });

    const { data, loading, error, refetch } = useAssignments(pageRequest);
    const { data: subjects } = useSubjects();
    const { data: classes } = useClassesWithFilters();

    // Debounce exercise set title search
    const {
        input: exerciseSetTitle,
        setInput: setExerciseSetTitle,
        debouncedValue: debouncedExerciseSetTitle,
    } = useSearchOptimization({ initialValue: '', minLength: 3 });

    // Update pageRequest when debounced value changes
    React.useEffect(() => {
        setPageRequest((prev) => ({
            ...prev,
            page: 0, // Reset to first page on filter change
            dataRequest: {
                ...(prev.dataRequest as AssignmentPageRequest),
                exerciseSetTitle: debouncedExerciseSetTitle,
            },
        }));
    }, [debouncedExerciseSetTitle]);

    const handleFilterChange = (newFilters: Partial<AssignmentPageRequest>) => {
        setPageRequest((prev) => ({
            ...prev,
            page: 0, // Reset to first page on filter change
            dataRequest: { ...(prev.dataRequest as AssignmentPageRequest), ...newFilters },
        }));
    };

    const handlePageChange = (page: number) => {
        setPageRequest((prev) => ({ ...prev, page }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPageRequest((prev) => ({ ...prev, pageSize, page: 0 }));
    };

    const handleCreate = () => {
        router.push('/assignments/create');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Quản lý Giao bài</h1>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                >
                    + Giao bài mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Lớp
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            value={(pageRequest.dataRequest as AssignmentPageRequest)?.classId || ''}
                            onChange={(e) =>
                                handleFilterChange({
                                    classId: e.target.value || undefined,
                                })
                            }
                        >
                            <option value="">Tất cả</option>
                            {classes?.map((classItem) => (
                                <option key={classItem.id} value={classItem.id}>
                                    {classItem.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tìm kiếm theo đề bài
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            placeholder="Nhập tên đề bài..."
                            value={exerciseSetTitle}
                            onChange={(e) => setExerciseSetTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Môn học
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            value={(pageRequest.dataRequest as AssignmentPageRequest)?.subjectId || ''}
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
                            Khoảng thời gian
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            value={(pageRequest.dataRequest as AssignmentPageRequest)?.timeRange || 'ALL'}
                            onChange={(e) =>
                                handleFilterChange({
                                    timeRange: (e.target.value as AssignmentPageRequest['timeRange']) || undefined,
                                })
                            }
                        >
                            <option value="ALL">Tất cả</option>
                            <option value="THIS_WEEK">Tuần này</option>
                            <option value="THIS_MONTH">Tháng này</option>
                            <option value="LAST_3_MONTHS">3 tháng gần đây</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && <LoadingState message="Đang tải..." />}

            {/* Error State */}
            {error && !loading && (
                <ErrorState
                    message={error.message}
                    action={{
                        label: 'Thử lại',
                        onClick: () => refetch(),
                    }}
                />
            )}

            {/* Table */}
            {!loading && !error && data && (
                <AssignmentListTable
                    assignments={data.content || []}
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

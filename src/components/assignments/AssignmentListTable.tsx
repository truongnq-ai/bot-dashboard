/**
 * Assignment List Table Component - Admin Dashboard
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AssignmentListItem } from '@/types/assignment';
import { ExerciseSetIntent } from '@/types/exercise-set';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import ActionsDropdown from '@/components/common/ActionsDropdown';
import { ActionItem } from '@/types/common';
import { formatDate } from '@/lib/utils/formatters';
import DeleteAssignmentModal from './DeleteAssignmentModal';

interface AssignmentListTableProps {
    assignments: AssignmentListItem[];
    onDelete?: () => void;
    pagination?: {
        page: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        onPageSizeChange: (pageSize: number) => void;
    };
}

const getIntentLabel = (intent: ExerciseSetIntent): string => {
    switch (intent) {
        case ExerciseSetIntent.PRACTICE:
            return 'Luyện tập';
        case ExerciseSetIntent.REVIEW:
            return 'Ôn tập';
        case ExerciseSetIntent.SURVEY:
            return 'Khảo sát';
        case ExerciseSetIntent.TEST:
            return 'Kiểm tra';
        default:
            return intent;
    }
};

export default function AssignmentListTable({
    assignments,
    onDelete,
    pagination,
}: AssignmentListTableProps) {
    const router = useRouter();
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        assignment: AssignmentListItem | null;
    }>({
        isOpen: false,
        assignment: null,
    });

    const handleEnterResults = (assignmentId: string) => {
        // Note: This route might not exist yet, assuming step 5 or similar will implement results
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/assignments/${assignmentId}/results?from=${encodeURIComponent(currentPath)}`);
    };

    const handleDeleteClick = (assignment: AssignmentListItem) => {
        setDeleteModal({ isOpen: true, assignment });
    };

    const handleDeleteSuccess = () => {
        setDeleteModal({ isOpen: false, assignment: null });
        onDelete?.();
    };

    const getActions = (assignment: AssignmentListItem): ActionItem[] => {
        return [
            {
                id: 'enter-results',
                label: 'Ghi nhận kết quả',
                type: 'info',
                onClick: () => handleEnterResults(assignment.id),
            },
            {
                id: 'delete',
                label: 'Xóa',
                type: 'danger',
                onClick: () => handleDeleteClick(assignment),
            },
        ];
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-hidden overflow-y-visible rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto no-scrollbar">
                    <div className="min-w-[800px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Đề bài
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Lớp
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Môn học
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Mục đích
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Ngày gán
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Thao tác
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {assignments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                                            Không tìm thấy giao bài nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    assignments.map((assignment) => (
                                        <TableRow key={assignment.id}>
                                            <TableCell className="px-4 py-3 text-gray-900 text-start text-theme-sm dark:text-white font-medium">
                                                {assignment.exerciseSetTitle}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {assignment.className}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {assignment.subjectName || '-'}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {getIntentLabel(assignment.intent)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {formatDate(assignment.assignedAt)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-start">
                                                <ActionsDropdown actions={getActions(assignment)} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-theme-sm text-gray-700 dark:text-gray-300">
                        <span className="hidden md:inline">
                            Hiển thị {pagination.page * pagination.pageSize + 1} đến{' '}
                            {Math.min((pagination.page + 1) * pagination.pageSize, pagination.totalElements)} trong tổng số{' '}
                            {pagination.totalElements} kết quả
                        </span>
                        <span className="md:hidden">
                            {pagination.page * pagination.pageSize + 1}-{Math.min((pagination.page + 1) * pagination.pageSize, pagination.totalElements)} / {pagination.totalElements}
                        </span>
                    </div>

                    <div className="flex items-center justify-center md:justify-end gap-2">
                        <button
                            onClick={() => pagination.onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 0}
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
                        >
                            Trước
                        </button>
                        <span className="text-theme-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Trang {pagination.page + 1} / {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => pagination.onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages - 1}
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Assignment Modal */}
            <DeleteAssignmentModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, assignment: null })}
                assignment={deleteModal.assignment}
                onSuccess={handleDeleteSuccess}
            />
        </div>
    );
}

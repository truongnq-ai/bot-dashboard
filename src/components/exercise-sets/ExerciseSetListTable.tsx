/**
 * Exercise Set List Table Component - Admin Dashboard
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExerciseSetListItem, ExerciseSetIntent } from '@/types/exercise-set';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import ActionsDropdown from '@/components/common/ActionsDropdown';
import { ActionItem } from '@/types/common';
import { formatDate } from '@/lib/utils/formatters';
import { deleteExerciseSet, duplicateExerciseSet } from '@/lib/api/exercise-set.service';
import ConfirmModal from '@/components/common/ConfirmModal';
import { toast } from 'react-hot-toast';

interface ExerciseSetListTableProps {
    exerciseSets: ExerciseSetListItem[];
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

export default function ExerciseSetListTable({
    exerciseSets,
    onDelete,
    pagination,
}: ExerciseSetListTableProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        exerciseSetId: string | null;
    }>({
        isOpen: false,
        exerciseSetId: null,
    });

    const handleDeleteClick = (id: string) => {
        setDeleteModal({ isOpen: true, exerciseSetId: id });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.exerciseSetId) return;

        try {
            setDeletingId(deleteModal.exerciseSetId);
            await deleteExerciseSet(deleteModal.exerciseSetId);
            toast.success('Xóa đề bài thành công');
            onDelete?.();
        } catch (error) {
            toast.error('Xóa đề bài thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
        } finally {
            setDeletingId(null);
            setDeleteModal({ isOpen: false, exerciseSetId: null });
        }
    };

    const handleDuplicate = async (id: string) => {
        try {
            setDuplicatingId(id);
            await duplicateExerciseSet(id);
            toast.success('Sao chép đề bài thành công');
            onDelete?.();
        } catch (error) {
            toast.error('Sao chép đề bài thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
        } finally {
            setDuplicatingId(null);
        }
    };

    const getActions = (exerciseSet: ExerciseSetListItem): ActionItem[] => {
        const actions: ActionItem[] = [
            {
                id: 'view',
                label: 'Xem chi tiết',
                type: 'info',
                onClick: () => {
                    const currentPath = window.location.pathname + window.location.search;
                    router.push(`/exercise-sets/${exerciseSet.id}?from=${encodeURIComponent(currentPath)}`);
                },
            },
            {
                id: 'edit',
                label: 'Chỉnh sửa',
                type: 'info',
                onClick: () => {
                    const currentPath = window.location.pathname + window.location.search;
                    router.push(`/exercise-sets/${exerciseSet.id}/edit?from=${encodeURIComponent(currentPath)}`);
                },
            },
            // Removed "Assign to Classes" for now as it might assume specific teacher-class relationships
            // If admin needs to assign, it might be a different flow.
            {
                id: 'duplicate',
                label: 'Sao chép',
                type: 'info',
                onClick: () => handleDuplicate(exerciseSet.id),
                disabled: duplicatingId === exerciseSet.id,
            },
            {
                id: 'delete',
                label: 'Xóa',
                type: 'danger',
                onClick: () => handleDeleteClick(exerciseSet.id),
                disabled: deletingId === exerciseSet.id,
            },
        ];

        return actions;
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
                                        Tiêu đề
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Môn học
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Mục đích
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Số bài tập
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Ngày tạo
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Thao tác
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {exerciseSets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                                            Không tìm thấy đề bài nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    exerciseSets.map((exerciseSet) => (
                                        <TableRow key={exerciseSet.id}>
                                            <TableCell className="px-4 py-3 text-gray-900 text-start text-theme-sm dark:text-white font-medium">
                                                {exerciseSet.title}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {exerciseSet.subjectName || '-'}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {getIntentLabel(exerciseSet.intent)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {exerciseSet.exerciseCount}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {formatDate(exerciseSet.createdAt)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-start">
                                                <ActionsDropdown actions={getActions(exerciseSet)} />
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
                    {/* Text info - responsive: full text on desktop, compact on mobile */}
                    <div className="text-theme-sm text-gray-700 dark:text-gray-300">
                        {/* Full text on desktop */}
                        <span className="hidden md:inline">
                            Hiển thị {pagination.page * pagination.pageSize + 1} đến{' '}
                            {Math.min((pagination.page + 1) * pagination.pageSize, pagination.totalElements)} trong tổng số{' '}
                            {pagination.totalElements} kết quả
                        </span>
                        {/* Compact text on mobile */}
                        <span className="md:hidden">
                            {pagination.page * pagination.pageSize + 1}-{Math.min((pagination.page + 1) * pagination.pageSize, pagination.totalElements)} / {pagination.totalElements}
                        </span>
                    </div>

                    {/* Controls - centered on mobile, right-aligned on desktop */}
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

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, exerciseSetId: null })}
                onConfirm={handleDeleteConfirm}
                variant="danger"
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa đề bài này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                isLoading={deletingId !== null}
            />
        </div>
    );
}

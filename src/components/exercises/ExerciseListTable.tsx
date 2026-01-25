/**
 * Exercise List Table Component - Admin Dashboard
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExerciseListItem } from '@/types/exercise';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import ExerciseStatusBadge from './ExerciseStatusBadge';
import ActionsDropdown from '@/components/common/ActionsDropdown';
import { ActionItem } from '@/types/common';
import { formatDate, getExerciseTypeName, getDifficultyLabel } from '@/lib/utils/formatters';
import DifficultyBadge from './DifficultyBadge';
import { deleteExercise, approveExercise, getExerciseById } from '@/lib/api/exercise.service';
import ConfirmModal from '@/components/common/ConfirmModal';
import { setExerciseDataForCopy } from '@/lib/utils/navigation';
import { toast } from 'react-hot-toast';

import { useReferenceData } from '@/context/ReferenceDataContext';

interface ExerciseListTableProps {
    exercises: ExerciseListItem[];
    onRefresh?: () => void; // Callback to refresh data after delete/approve
    pagination?: {
        page: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        onPageSizeChange: (pageSize: number) => void;
    };
}

export default function ExerciseListTable({
    exercises,
    onRefresh,
    pagination,
}: ExerciseListTableProps) {
    const router = useRouter();
    const { getSubjectName, getTopicName } = useReferenceData();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [copyingId, setCopyingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        exerciseId: string | null;
    }>({
        isOpen: false,
        exerciseId: null,
    });

    const handleDeleteClick = (id: string) => {
        setDeleteModal({ isOpen: true, exerciseId: id });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.exerciseId) return;

        try {
            setDeletingId(deleteModal.exerciseId);
            await deleteExercise(deleteModal.exerciseId);
            toast.success('Xóa bài tập thành công');
            onRefresh?.();
        } catch (error) {
            toast.error('Xóa bài tập thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
        } finally {
            setDeletingId(null);
            setDeleteModal({ isOpen: false, exerciseId: null });
        }
    };

    const handleApprove = async (id: string) => {
        try {
            setApprovingId(id);
            await approveExercise(id);
            toast.success('Duyệt bài tập thành công');
            onRefresh?.();
        } catch (error) {
            toast.error('Duyệt bài tập thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
        } finally {
            setApprovingId(null);
        }
    };

    const handleCopy = async (id: string) => {
        try {
            setCopyingId(id);
            const response = await getExerciseById(id);
            if (response.data) {
                // Loại bỏ các field không cần: id, teacherId, status, createdBy, createdAt, updatedAt, subjectName, topicName
                // Keep all new metadata fields for copy
                const {
                    id: _,
                    teacherId: __,
                    status: ___,
                    createdBy: ____,
                    createdAt: _____,
                    updatedAt: ______,
                    subjectName: _______,
                    topicName: ________,
                    ...copyData
                } = response.data;
                setExerciseDataForCopy(copyData);
                router.push('/exercises/create');
            }
        } catch (error) {
            toast.error('Sao chép bài tập thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
        } finally {
            setCopyingId(null);
        }
    };

    const getActions = (exercise: ExerciseListItem): ActionItem[] => {
        const actions: ActionItem[] = [
            {
                id: 'view',
                label: 'Xem chi tiết',
                type: 'info',
                onClick: () => {
                    const currentPath = window.location.pathname + window.location.search;
                    router.push(`/exercises/${exercise.id}?from=${encodeURIComponent(currentPath)}`);
                },
            },
            {
                id: 'edit',
                label: 'Chỉnh sửa',
                type: 'info',
                onClick: () => {
                    const currentPath = window.location.pathname + window.location.search;
                    router.push(`/exercises/${exercise.id}/edit?from=${encodeURIComponent(currentPath)}`);
                },
            },
            {
                id: 'copy',
                label: 'Sao chép',
                type: 'info',
                onClick: () => handleCopy(exercise.id),
                disabled: copyingId === exercise.id,
            },
        ];

        if (exercise.status === 'DRAFT') {
            actions.push({
                id: 'approve',
                label: 'Duyệt',
                type: 'success',
                onClick: () => handleApprove(exercise.id),
                disabled: approvingId === exercise.id,
            });
        }

        actions.push({
            id: 'delete',
            label: 'Xóa',
            type: 'danger',
            onClick: () => handleDeleteClick(exercise.id),
            disabled: deletingId === exercise.id,
        });

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
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-24">
                                        Chủ đề
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-156">
                                        Nội dung
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-24">
                                        Độ khó
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-24">
                                        Loại bài tập
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-24">
                                        Trạng thái
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-24">
                                        Ngày tạo
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-22">
                                        Thao tác
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {exercises.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                                            Không tìm thấy bài tập nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    exercises.map((exercise) => (
                                        <TableRow key={exercise.id}>
                                            {/* Cột Chủ đề (gộp Môn học + Chủ đề) */}
                                            <TableCell className="px-4 py-3 text-start w-28">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 dark:text-white font-medium text-theme-sm">
                                                        {getSubjectName(exercise.subjectId) || exercise.subjectId || '-'}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400 text-theme-xs mt-0.5">
                                                        {getTopicName(exercise.topicId) || exercise.topicId || '-'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Cột Nội dung (mới) */}
                                            <TableCell className="px-4 py-3 text-start w-156">
                                                <div
                                                    className="text-gray-700 dark:text-gray-300 text-theme-sm line-clamp-3 prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: exercise.content || '' }}
                                                />
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-start w-24">
                                                <DifficultyBadge difficulty={exercise.difficulty} />
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 w-28">
                                                {getExerciseTypeName(exercise.type)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center w-24">
                                                <ExerciseStatusBadge status={exercise.status} />
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 w-28">
                                                {formatDate(exercise.createdAt)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center">
                                                <ActionsDropdown actions={getActions(exercise)} />
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
                onClose={() => setDeleteModal({ isOpen: false, exerciseId: null })}
                onConfirm={handleDeleteConfirm}
                variant="danger"
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa bài tập này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                isLoading={deletingId !== null}
            />
        </div>
    );
}

/**
 * Exercise List Table Component
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise, ReviewStatus } from '@/types/exercise';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import ReviewStatusBadge from './ReviewStatusBadge';
import ActionsDropdown from '@/components/common/ActionsDropdown';
import { ActionItem } from '@/types/common';
import { formatDate, truncateText, formatIdShort } from '@/lib/utils/formatters';
import { deleteExercise } from '@/lib/api/exercise.service';
import { showError, showSuccess } from '@/lib/utils/toast';
import MathText from '@/components/common/MathText';

interface ExerciseListTableProps {
  exercises: Exercise[];
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

export default function ExerciseListTable({
  exercises,
  onDelete,
  pagination,
}: ExerciseListTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài tập này?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteExercise(id);
      showSuccess('Xóa bài tập thành công');
      onDelete?.();
    } catch (error) {
      showError('Xóa bài tập thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    } finally {
      setDeletingId(null);
    }
  };

  const getActions = (exercise: Exercise): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        id: 'view',
        label: 'Xem chi tiết',
        type: 'info',
        onClick: () => router.push(`/content/exercises/${exercise.id}`),
      },
      {
        id: 'edit',
        label: 'Chỉnh sửa',
        type: 'warning',
        onClick: () => router.push(`/content/exercises/${exercise.id}/edit`),
      },
    ];

    // Review action removed for Phase 1 - review workflow is not in Phase 1 scope

    actions.push({
      id: 'delete',
      label: deletingId === exercise.id ? 'Đang xóa...' : 'Xóa',
      type: 'danger',
      onClick: () => handleDelete(exercise.id),
      disabled: deletingId === exercise.id,
    });

    return actions;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-hidden overflow-y-visible rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto no-scrollbar">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Nội dung bài toán
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Chương
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Lớp
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Độ khó
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Trạng thái
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Điểm chất lượng
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Số lần sử dụng
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
                {exercises.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy bài tập nào
                    </TableCell>
                  </TableRow>
                ) : (
                  exercises.map((exercise) => (
                    <TableRow key={exercise.id}>
                      <TableCell 
                        className="px-5 py-4 sm:px-6 text-start text-theme-sm dark:text-white/90 font-mono cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => router.push(`/content/exercises/${exercise.id}`)}
                      >
                        {formatIdShort(exercise.id)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="max-w-md truncate">
                          <MathText text={truncateText(exercise.problemText, 50)} />
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {exercise.chapterName || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {exercise.grade}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {exercise.difficultyLevel || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <ReviewStatusBadge status={exercise.reviewStatus} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {exercise.qualityScore ? exercise.qualityScore.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {exercise.usageCount}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(exercise.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Hiển thị {pagination.page * pagination.pageSize + 1} đến{' '}
            {Math.min((pagination.page + 1) * pagination.pageSize, pagination.totalElements)} trong tổng số{' '}
            {pagination.totalElements} kết quả
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Trang {pagination.page + 1} / {pagination.totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

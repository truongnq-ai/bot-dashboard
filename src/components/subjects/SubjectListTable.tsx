'use client';

import React, { useState, useMemo } from 'react';
import { Subject } from '@/types/subject';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import ActionsDropdown from '@/components/common/ActionsDropdown';
import { ActionItem } from '@/types/common';
import { formatDate } from '@/lib/utils/formatters';
import { deleteSubject } from '@/lib/api/subject.service';
import { showError, showSuccess } from '@/lib/utils/toast';
import ConfirmModal from '@/components/common/ConfirmModal';

interface SubjectListTableProps {
  subjects: Subject[];
  onViewDetail?: (subject: Subject) => void;
  onEdit?: (subject: Subject) => void;
  onDelete?: () => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalElements: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

export default function SubjectListTable({
  subjects,
  onViewDetail,
  onEdit,
  onDelete,
  pagination,
}: SubjectListTableProps) {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    subject: Subject | null;
  }>({
    isOpen: false,
    subject: null,
  });

  // Client-side pagination
  const paginatedSubjects = useMemo(() => {
    if (!pagination) return subjects;
    const start = pagination.page * pagination.pageSize;
    const end = start + pagination.pageSize;
    return subjects.slice(start, end);
  }, [subjects, pagination]);

  const totalPages = pagination
    ? Math.ceil(pagination.totalElements / pagination.pageSize)
    : 1;

  const handleDelete = async (subject: Subject) => {
    try {
      const response = await deleteSubject(subject.id);
      if (response.errorCode === '0000') {
        showSuccess('Xóa môn học thành công');
        setDeleteModal({ isOpen: false, subject: null });
        if (onDelete) {
          onDelete();
        }
      } else {
        showError(response.errorDetail || 'Xóa môn học thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi xóa môn học');
    }
  };

  const getActions = (subject: Subject): ActionItem[] => {
    const actions: ActionItem[] = [];

    if (onViewDetail) {
      actions.push({
        id: 'view',
        label: 'Xem chi tiết',
        type: 'success',
        onClick: () => onViewDetail(subject),
      });
    }

    if (onEdit) {
      actions.push({
        id: 'edit',
        label: 'Chỉnh sửa',
        type: 'info',
        onClick: () => onEdit(subject),
      });
    }

    actions.push({
      id: 'delete',
      label: 'Xóa',
      type: 'danger',
      onClick: () => setDeleteModal({ isOpen: true, subject }),
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
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Tên môn học
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Thứ tự
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
                {paginatedSubjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy môn học nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="px-4 py-3 text-gray-900 text-start text-theme-sm dark:text-white font-medium">
                        {subject.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {subject.orderIndex ?? '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(subject.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <ActionsDropdown actions={getActions(subject)} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Client-side Pagination */}
      {pagination && totalPages > 1 && (
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
              Trang {pagination.page + 1} / {totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages - 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, subject: null })}
        onConfirm={() => {
          if (deleteModal.subject) {
            handleDelete(deleteModal.subject);
          }
        }}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa môn học "${deleteModal.subject?.name}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </div>
  );
}


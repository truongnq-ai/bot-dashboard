'use client';

import React, { useState } from 'react';
import { Student } from '@/types/student';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import StudentStatusBadge from './StudentStatusBadge';
import ActionsDropdown from '@/components/common/ActionsDropdown';
import { ActionItem } from '@/types/common';
import { formatDate, truncateText } from '@/lib/utils/formatters';
import { updateStudentStatus } from '@/lib/api/student.service';
import { showError, showSuccess } from '@/lib/utils/toast';

interface StudentListTableProps {
  students: Student[];
  onStatusChange?: () => void;
  onViewDetail?: (student: Student) => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

export default function StudentListTable({
  students,
  onStatusChange,
  onViewDetail,
  pagination,
}: StudentListTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (student: Student, newStatus: 'ACTIVE' | 'INACTIVE' | 'LOCKED') => {
    if (!confirm(`Bạn có chắc muốn thay đổi trạng thái của ${student.username} thành ${newStatus === 'ACTIVE' ? 'Hoạt động' : newStatus === 'INACTIVE' ? 'Không hoạt động' : 'Đã khóa'}?`)) {
      return;
    }

    try {
      setUpdatingId(student.userId);
      const response = await updateStudentStatus(student.userId, newStatus);
      if (response.errorCode === '0000') {
        showSuccess('Cập nhật trạng thái thành công');
        onStatusChange?.();
      } else {
        showError(response.errorDetail || 'Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      showError('Hệ thống không có phản hồi.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getActions = (student: Student): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        id: 'view',
        label: 'Xem chi tiết',
        type: 'success',
        onClick: () => onViewDetail?.(student),
      },
    ];

    if (student.status === 'ACTIVE') {
      actions.push({
        id: 'deactivate',
        label: 'Vô hiệu hóa',
        type: 'danger',
        onClick: () => handleStatusChange(student, 'INACTIVE'),
        disabled: updatingId === student.userId,
      });
      actions.push({
        id: 'lock',
        label: 'Khóa',
        type: 'danger',
        onClick: () => handleStatusChange(student, 'LOCKED'),
        disabled: updatingId === student.userId,
      });
    } else if (student.status === 'INACTIVE') {
      actions.push({
        id: 'activate',
        label: 'Kích hoạt',
        type: 'success',
        onClick: () => handleStatusChange(student, 'ACTIVE'),
        disabled: updatingId === student.userId,
      });
    } else if (student.status === 'LOCKED') {
      actions.push({
        id: 'activate',
        label: 'Mở khóa',
        type: 'success',
        onClick: () => handleStatusChange(student, 'ACTIVE'),
        disabled: updatingId === student.userId,
      });
    }

    return actions;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-hidden overflow-y-visible rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto no-scrollbar">
          <div className="min-w-[1400px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Username
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Tên
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Lớp
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Phụ huynh
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Trạng thái
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Lần đăng nhập cuối
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
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy học sinh nào
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id || student.userId}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-theme-sm dark:text-white/90">
                        {truncateText(student.id || student.userId, 8)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 text-start text-theme-sm dark:text-white font-medium">
                        {student.username}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {student.name || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {student.grade ? `Lớp ${student.grade}` : '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {student.parentName || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <StudentStatusBadge status={student.status} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {student.lastLoginAt ? formatDate(student.lastLoginAt) : 'Chưa đăng nhập'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(student.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <ActionsDropdown actions={getActions(student)} />
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


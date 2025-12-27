'use client';

import React, { useState } from 'react';
import { Parent } from '@/types/parent';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import ParentStatusBadge from './ParentStatusBadge';
import ActionsDropdown from '@/components/common/ActionsDropdown';
import { ActionItem } from '@/types/common';
import { formatDate, truncateText } from '@/lib/utils/formatters';
import { updateParentStatus } from '@/lib/api/parent.service';
import { showError, showSuccess } from '@/lib/utils/toast';

interface ParentListTableProps {
  parents: Parent[];
  onStatusChange?: () => void;
  onViewDetail?: (parent: Parent) => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

export default function ParentListTable({
  parents,
  onStatusChange,
  onViewDetail,
  pagination,
}: ParentListTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (parent: Parent, newStatus: 'ACTIVE' | 'INACTIVE' | 'LOCKED') => {
    if (!confirm(`Bạn có chắc muốn thay đổi trạng thái của ${parent.username} thành ${newStatus === 'ACTIVE' ? 'Hoạt động' : newStatus === 'INACTIVE' ? 'Không hoạt động' : 'Đã khóa'}?`)) {
      return;
    }

    try {
      setUpdatingId(parent.userId);
      const response = await updateParentStatus(parent.userId, newStatus);
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

  const getActions = (parent: Parent): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        id: 'view',
        label: 'Xem chi tiết',
        type: 'success',
        onClick: () => onViewDetail?.(parent),
      },
    ];

    if (parent.status === 'ACTIVE') {
      actions.push({
        id: 'deactivate',
        label: 'Vô hiệu hóa',
        type: 'danger',
        onClick: () => handleStatusChange(parent, 'INACTIVE'),
        disabled: updatingId === parent.userId,
      });
      actions.push({
        id: 'lock',
        label: 'Khóa',
        type: 'danger',
        onClick: () => handleStatusChange(parent, 'LOCKED'),
        disabled: updatingId === parent.userId,
      });
    } else if (parent.status === 'INACTIVE') {
      actions.push({
        id: 'activate',
        label: 'Kích hoạt',
        type: 'success',
        onClick: () => handleStatusChange(parent, 'ACTIVE'),
        disabled: updatingId === parent.userId,
      });
    } else if (parent.status === 'LOCKED') {
      actions.push({
        id: 'activate',
        label: 'Mở khóa',
        type: 'success',
        onClick: () => handleStatusChange(parent, 'ACTIVE'),
        disabled: updatingId === parent.userId,
      });
    }

    return actions;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-hidden overflow-y-visible rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto no-scrollbar">
          <div className="min-w-[1300px]">
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
                    Email
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Số học sinh
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
                {parents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy phụ huynh nào
                    </TableCell>
                  </TableRow>
                ) : (
                  parents.map((parent) => (
                    <TableRow key={parent.id || parent.userId}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-theme-sm dark:text-white/90">
                        {truncateText(parent.id || parent.userId, 8)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 text-start text-theme-sm dark:text-white font-medium">
                        {parent.username}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {parent.name || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {parent.email || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {parent.linkedStudentsCount || 0} học sinh
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <ParentStatusBadge status={parent.status} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {parent.lastLoginAt ? formatDate(parent.lastLoginAt) : 'Chưa đăng nhập'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(parent.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <ActionsDropdown actions={getActions(parent)} />
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


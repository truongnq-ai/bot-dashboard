'use client';

import React from 'react';
import { PromptTemplate } from '@/types/prompt-template';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import ActionsDropdown from '@/components/common/ActionsDropdown';
import { ActionItem } from '@/types/common';
import { formatDate, formatIdShort } from '@/lib/utils/formatters';

interface PromptTemplateListTableProps {
  templates: PromptTemplate[];
  onViewDetail?: (template: PromptTemplate) => void;
  onEdit?: (template: PromptTemplate) => void;
  onDelete?: (template: PromptTemplate) => void;
  onActivate?: (template: PromptTemplate) => void;
  onDeactivate?: (template: PromptTemplate) => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

export default function PromptTemplateListTable({
  templates,
  onViewDetail,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  pagination,
}: PromptTemplateListTableProps) {
  const getActions = (template: PromptTemplate): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        id: 'view',
        label: 'Xem chi tiết',
        type: 'success',
        onClick: () => onViewDetail?.(template),
      },
    ];

    if (onEdit) {
      actions.push({
        id: 'edit',
        label: 'Chỉnh sửa',
        type: 'info',
        onClick: () => onEdit(template),
      });
    }

    if (template.isActive && onDeactivate) {
      actions.push({
        id: 'deactivate',
        label: 'Vô hiệu hóa',
        type: 'warning',
        onClick: () => onDeactivate(template),
      });
    } else if (!template.isActive && onActivate) {
      actions.push({
        id: 'activate',
        label: 'Kích hoạt',
        type: 'success',
        onClick: () => onActivate(template),
      });
    }

    if (onDelete) {
      actions.push({
        id: 'delete',
        label: 'Xóa',
        type: 'danger',
        onClick: () => onDelete(template),
      });
    }

    return actions;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-hidden overflow-y-visible rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto no-scrollbar">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Tên template
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Version
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Trạng thái
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Người tạo
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
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy prompt template nào
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell 
                        className="px-5 py-4 sm:px-6 text-start text-theme-sm dark:text-white/90 font-mono cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => onViewDetail?.(template)}
                      >
                        {formatIdShort(template.id)}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-theme-sm dark:text-white/90 font-medium">
                        {template.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        v{template.version}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            template.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {template.isActive ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {template.createdBy || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatDate(template.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <ActionsDropdown actions={getActions(template)} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Hiển thị {pagination.page * pagination.pageSize + 1} -{' '}
            {Math.min((pagination.page + 1) * pagination.pageSize, pagination.totalElements)} trong tổng số{' '}
            {pagination.totalElements} template
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Trang {pagination.page + 1} / {pagination.totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


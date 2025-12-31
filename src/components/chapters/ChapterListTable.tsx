'use client';

import React, { useState } from 'react';
import { Chapter } from '@/types/chapter';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import ActionsDropdown from '@/components/common/ActionsDropdown';
import { ActionItem } from '@/types/common';
import { formatDate } from '@/lib/utils/formatters';
import ChapterSkillsModal from './ChapterSkillsModal';

interface ChapterListTableProps {
  chapters: Chapter[];
  onViewDetail?: (chapter: Chapter) => void;
  onEdit?: (chapter: Chapter) => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

export default function ChapterListTable({
  chapters,
  onViewDetail,
  onEdit,
  pagination,
}: ChapterListTableProps) {
  const [skillsModal, setSkillsModal] = useState<{
    isOpen: boolean;
    chapter: Chapter | null;
  }>({
    isOpen: false,
    chapter: null,
  });

  const handleViewSkills = (chapter: Chapter) => {
    setSkillsModal({
      isOpen: true,
      chapter,
    });
  };

  const getActions = (chapter: Chapter): ActionItem[] => {
    const actions: ActionItem[] = [];

    if (onViewDetail) {
      actions.push({
        id: 'view',
        label: 'Xem chi tiết',
        type: 'success',
        onClick: () => onViewDetail(chapter),
      });
    }

    if (onEdit) {
      actions.push({
        id: 'edit',
        label: 'Chỉnh sửa',
        type: 'info',
        onClick: () => onEdit(chapter),
      });
    }

    actions.push({
      id: 'skills',
      label: 'Danh sách kỹ năng',
      type: 'info',
      onClick: () => handleViewSkills(chapter),
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
                    Code
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Tên chương
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Lớp
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Mô tả
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
                {chapters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy chương nào
                    </TableCell>
                  </TableRow>
                ) : (
                  chapters.map((chapter) => (
                    <TableRow key={chapter.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-theme-sm dark:text-white/90 font-mono">
                        {chapter.code}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 text-start text-theme-sm dark:text-white font-medium">
                        {chapter.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          Lớp {chapter.grade}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {chapter.description || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(chapter.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <ActionsDropdown actions={getActions(chapter)} />
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

      {/* Chapter Skills Modal */}
      <ChapterSkillsModal
        isOpen={skillsModal.isOpen}
        onClose={() => setSkillsModal({ isOpen: false, chapter: null })}
        chapter={skillsModal.chapter}
      />
    </div>
  );
}


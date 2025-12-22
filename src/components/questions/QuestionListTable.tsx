/**
 * Question List Table Component
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Question, QuestionStatus } from '@/types/question';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, truncateText, formatIdShort } from '@/lib/utils/formatters';

interface QuestionListTableProps {
  questions: Question[];
  pagination?: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

function getStatusBadge(status: QuestionStatus) {
  const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
  switch (status) {
    case QuestionStatus.DRAFT:
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`}>Nháp</span>;
    case QuestionStatus.ASSIGNED:
      return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>Đã assign</span>;
    case QuestionStatus.COMPLETED:
      return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>Đã hoàn thành</span>;
    case QuestionStatus.SKIPPED:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`}>Đã bỏ qua</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`}>{status}</span>;
  }
}

export default function QuestionListTable({
  questions,
  pagination,
}: QuestionListTableProps) {
  const router = useRouter();

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
                    Exercise
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Kỹ năng
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Nội dung
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Trạng thái
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Practice Count
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Kết quả
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
                {questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      Không có câu hỏi nào
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((question) => (
                    <TableRow
                      key={question.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => router.push(`/content/questions/${question.id}`)}
                    >
                      <TableCell 
                        className="px-5 py-4 sm:px-6 text-start text-theme-sm dark:text-white/90 font-mono cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn event bubbling nếu row có onClick
                          router.push(`/content/questions/${question.id}`);
                        }}
                      >
                        {formatIdShort(question.id)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {question.exerciseName || truncateText(question.exerciseId, 8)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {question.skillCode && (
                          <span>
                            {question.skillCode} - {question.skillName || ''}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {truncateText(question.problemText, 100)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        {getStatusBadge(question.status)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {question.practiceCount || 0}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        {question.isCorrect !== undefined && (
                          <span className={question.isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {question.isCorrect ? '✓' : '✗'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(question.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <button
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => router.push(`/content/questions/${question.id}`)}
                        >
                          Xem chi tiết
                        </button>
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


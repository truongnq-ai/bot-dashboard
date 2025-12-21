/**
 * Compact Question List Component (for integration in other pages)
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Question, QuestionStatus } from '@/types/question';
import { formatDate, truncateText } from '@/lib/utils/formatters';

interface QuestionListCompactProps {
  questions: Question[];
  showExerciseLink?: boolean;
  maxItems?: number;
}

function getStatusBadge(status: QuestionStatus) {
  const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
  switch (status) {
    case QuestionStatus.ASSIGNED:
      return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>Đã assign</span>;
    case QuestionStatus.COMPLETED:
      return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>Đã hoàn thành</span>;
    case QuestionStatus.SKIPPED:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`}>Đã bỏ qua</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
  }
}

export default function QuestionListCompact({
  questions,
  showExerciseLink = false,
  maxItems = 10,
}: QuestionListCompactProps) {
  const router = useRouter();
  const displayQuestions = questions.slice(0, maxItems);
  const hasMore = questions.length > maxItems;

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>Chưa có câu hỏi nào được sinh từ bài tập này</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Câu hỏi đã sinh ({questions.length})
        </h3>
        {hasMore && (
          <button
            onClick={() => router.push(`/content/questions?exerciseId=${questions[0]?.exerciseId}`)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Xem tất cả ({questions.length})
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">ID</th>
              {showExerciseLink && (
                <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">Exercise</th>
              )}
              <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">Nội dung</th>
              <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">Trạng thái</th>
              <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">Practice</th>
              <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">Ngày tạo</th>
              <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {displayQuestions.map((question) => (
              <tr
                key={question.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="p-2 font-mono text-xs">{truncateText(question.id, 8)}</td>
                {showExerciseLink && (
                  <td className="p-2">
                    <button
                      onClick={() => router.push(`/content/exercises/${question.exerciseId}`)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                    >
                      {truncateText(question.exerciseId, 8)}
                    </button>
                  </td>
                )}
                <td className="p-2 max-w-xs">
                  <div className="truncate">{truncateText(question.problemText, 60)}</div>
                </td>
                <td className="p-2">{getStatusBadge(question.status)}</td>
                <td className="p-2">{question.practiceCount || 0}</td>
                <td className="p-2">{formatDate(question.createdAt)}</td>
                <td className="p-2">
                  <button
                    onClick={() => router.push(`/content/questions/${question.id}`)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                  >
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => router.push(`/content/questions?exerciseId=${questions[0]?.exerciseId}`)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Xem thêm {questions.length - maxItems} câu hỏi...
          </button>
        </div>
      )}
    </div>
  );
}


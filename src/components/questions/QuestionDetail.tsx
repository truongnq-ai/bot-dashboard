/**
 * Question Detail Component
 */

'use client';

import React from 'react';
import { useQuestion } from '@/lib/hooks/useQuestions';
import { QuestionStatus } from '@/types/question';
import { formatDate } from '@/lib/utils/formatters';

interface QuestionDetailProps {
  questionId: string;
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

export default function QuestionDetail({ questionId }: QuestionDetailProps) {
  const { data: question, loading, error } = useQuestion(questionId);

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Lỗi: {error.message}</p>
      </div>
    );
  }

  if (!question) {
    return <div className="text-center py-8">Không tìm thấy câu hỏi</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chi tiết câu hỏi</h1>
        <div>{getStatusBadge(question.status)}</div>
      </div>

      {/* Question Info */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Thông tin câu hỏi</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">ID</label>
            <p className="font-mono text-sm">{question.id}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Exercise ID</label>
            <p className="font-mono text-sm">{question.exerciseId}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Kỹ năng</label>
            <p className="text-sm">{question.skillCode} - {question.skillName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Độ khó</label>
            <p className="text-sm">{question.difficultyLevel || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Loại</label>
            <p className="text-sm">{question.questionType || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Practice Count</label>
            <p className="text-sm">{question.practiceCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Problem Text */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Nội dung câu hỏi</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{question.problemText}</p>
          {question.problemLatex && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
              <code>{question.problemLatex}</code>
            </div>
          )}
        </div>
      </div>

      {/* Solution Steps */}
      {question.solutionSteps && question.solutionSteps.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Lời giải</h2>
          <div className="space-y-4">
            {question.solutionSteps.map((step, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="font-semibold">Bước {step.stepNumber}: {step.description}</div>
                <div className="mt-2">{step.content}</div>
                {step.explanation && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{step.explanation}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Response */}
      {question.status === QuestionStatus.COMPLETED && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Kết quả làm bài</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Câu trả lời của học sinh</label>
              <p className="text-sm">{question.studentAnswer || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Đáp án đúng</label>
              <p className="text-sm">{question.finalAnswer || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Kết quả</label>
              <p className={`text-sm font-semibold ${question.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {question.isCorrect ? 'Đúng' : 'Sai'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Thời gian làm bài</label>
              <p className="text-sm">{question.timeTakenSec ? `${question.timeTakenSec} giây` : 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Ngày nộp bài</label>
              <p className="text-sm">{question.submittedAt ? formatDate(question.submittedAt) : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Practices Tab */}
      {question.practices && question.practices.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Practices ({question.practices.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Kết quả</th>
                  <th className="text-left p-2">Thời gian</th>
                  <th className="text-left p-2">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {question.practices.map((practice) => (
                  <tr key={practice.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{practice.id.substring(0, 8)}</td>
                    <td className="p-2">
                      <span className={practice.isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {practice.isCorrect ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="p-2">{practice.durationSec ? `${practice.durationSec}s` : 'N/A'}</td>
                    <td className="p-2">{formatDate(practice.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


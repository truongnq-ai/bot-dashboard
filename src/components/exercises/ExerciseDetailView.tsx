/**
 * Exercise Detail View Component
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useExercise, useExerciseStats, useReviewHistory } from '@/lib/hooks/useExercises';
import { useQuestionsByExercise } from '@/lib/hooks/useQuestions';
import ReviewStatusBadge from './ReviewStatusBadge';
import QuestionListCompact from '@/components/questions/QuestionListCompact';
import { formatDate, formatDateTime } from '@/lib/utils/formatters';
import { ReviewStatus } from '@/types/exercise';
import MathText from '@/components/common/MathText';

interface ExerciseDetailViewProps {
  id: string;
  aiMetadata?: {
    providerUsed?: string;
    confidence?: number;
    generationTimestamp?: string;
  };
}

export default function ExerciseDetailView({ id, aiMetadata }: ExerciseDetailViewProps) {
  const router = useRouter();
  const { data: exercise, loading, error } = useExercise(id);
  const { data: stats } = useExerciseStats(id);
  const { data: reviewHistory } = useReviewHistory(id);
  const { data: questions, loading: questionsLoading } = useQuestionsByExercise(id);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'stats' | 'questions'>('info');

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (error || !exercise) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Lỗi: {error?.message || 'Không tìm thấy bài tập'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chi tiết bài tập</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">ID: {exercise.id}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/content/exercises/${exercise.id}/edit`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Sửa
          </Link>
          {/* Review action removed for Phase 1 - review workflow is not in Phase 1 scope */}
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Quay lại
          </button>
        </div>
      </div>

      {/* AI Generated Badge */}
      {(aiMetadata || (exercise.qualityScore && exercise.createdBy)) && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
              AI Generated
            </span>
            {aiMetadata?.providerUsed && (
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Provider: {aiMetadata.providerUsed.toUpperCase()}
              </span>
            )}
            {(aiMetadata?.confidence !== undefined || exercise.qualityScore) && (
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Confidence: {((aiMetadata?.confidence ?? exercise.qualityScore ?? 0) * 100).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Thông tin
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Lịch sử duyệt
          </button>
          {exercise.reviewStatus === ReviewStatus.APPROVED && (
            <>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Thống kê
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'questions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Câu hỏi đã sinh {questions && questions.length > 0 && `(${questions.length})`}
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</label>
                <div className="mt-1">
                  <ReviewStatusBadge status={exercise.reviewStatus} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lớp</label>
                <p className="mt-1 text-gray-900 dark:text-white">{exercise.grade}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Độ khó</label>
                <p className="mt-1 text-gray-900 dark:text-white">{exercise.difficultyLevel || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Điểm chất lượng</label>
                <p className="mt-1 text-gray-900 dark:text-white">{exercise.qualityScore?.toFixed(2) || '-'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nội dung bài toán
              </label>
              <div className="mt-1 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <MathText 
                  text={exercise.problemText} 
                  className="text-gray-900 dark:text-white whitespace-pre-wrap" 
                />
              </div>
            </div>

            {exercise.problemImageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hình ảnh bài toán
                </label>
                <img
                  src={exercise.problemImageUrl}
                  alt="Bài toán"
                  className="mt-1 max-w-md rounded-lg border border-gray-300 dark:border-gray-600"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Các bước giải
              </label>
              <div className="mt-1 space-y-4">
                {exercise.solutionSteps.map((step, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="font-medium text-gray-900 dark:text-white mb-2">
                      Bước {step.stepNumber}: {step.description || 'Không có mô tả'}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 mb-2">
                      <MathText text={step.content} />
                    </div>
                    {step.explanation && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                        <MathText text={step.explanation} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lỗi thường gặp
                </label>
                <div className="mt-1 space-y-2">
                  {exercise.commonMistakes.map((mistake, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium text-gray-900 dark:text-white">
                        <MathText text={mistake.mistake} />
                      </div>
                      {mistake.explanation && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <MathText text={mistake.explanation} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ngày tạo</label>
                <p className="mt-1 text-gray-900 dark:text-white">{formatDateTime(exercise.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ngày cập nhật</label>
                <p className="mt-1 text-gray-900 dark:text-white">{formatDateTime(exercise.updatedAt)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {reviewHistory && reviewHistory.length > 0 ? (
              reviewHistory.map((log) => (
                <div key={log.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <ReviewStatusBadge status={log.reviewStatus} />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Được duyệt bởi {log.reviewedBy} vào {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                  {log.reviewNotes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{log.reviewNotes}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Không có lịch sử duyệt</p>
            )}
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tổng số lần thử</label>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAttempts}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tỷ lệ thành công</label>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {(stats.avgSuccessRate * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số lần sử dụng</label>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.usageCount}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian trung bình</label>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {stats.avgTimeSec ? `${stats.avgTimeSec}s` : '-'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div>
            {questionsLoading ? (
              <div className="text-center py-8">Đang tải câu hỏi...</div>
            ) : (
              <QuestionListCompact questions={questions || []} maxItems={10} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

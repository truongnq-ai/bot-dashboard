/**
 * Exercise Review Panel Component
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useExercise, useReviewHistory } from '@/lib/hooks/useExercises';
import { reviewExercise } from '@/lib/api/exercise.service';
import { ReviewExerciseRequest, ReviewStatus } from '@/types/exercise';
import ReviewStatusBadge from './ReviewStatusBadge';
import { formatDateTime } from '@/lib/utils/formatters';
import { showError, showSuccess } from '@/lib/utils/toast';
import MathText from '@/components/common/MathText';
import { BUTTON_LOADING_CONFIG } from '@/lib/config/ui.config';

interface ExerciseReviewPanelProps {
  id: string;
}

export default function ExerciseReviewPanel({ id }: ExerciseReviewPanelProps) {
  const router = useRouter();
  const { data: exercise, loading: exerciseLoading } = useExercise(id);
  const { data: reviewHistory } = useReviewHistory(id);
  const [qualityScore, setQualityScore] = useState<number>(0.7);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | null>(null);
  const [submittingStatus, setSubmittingStatus] = useState<ReviewStatus | null>(null);
  const [loadingDots, setLoadingDots] = useState('.');

  // Animation for loading dots
  useEffect(() => {
    if (submittingStatus !== null) {
      const interval = setInterval(() => {
        setLoadingDots((prev) => {
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          return '.';
        });
      }, BUTTON_LOADING_CONFIG.DOTS_ANIMATION_INTERVAL);

      return () => clearInterval(interval);
    } else {
      setLoadingDots('.');
    }
  }, [submittingStatus]);

  // Auto redirect to exercise list if exercise is already reviewed
  useEffect(() => {
    if (!exerciseLoading && exercise && exercise.reviewStatus !== ReviewStatus.PENDING) {
      router.push('/content/exercises');
    }
  }, [exercise, exerciseLoading, router]);

  const handleSubmit = async (status: ReviewStatus) => {
    // Validation
    if (status === ReviewStatus.REJECTED && !reviewNotes.trim()) {
      showError('Cần nhập ghi chú khi từ chối bài tập');
      return;
    }

    if (status === ReviewStatus.APPROVED && qualityScore < 0.7) {
      showError('Điểm chất lượng phải ít nhất 0.7 để duyệt bài tập');
      return;
    }

    setSubmittingStatus(status);

    try {
      const request: ReviewExerciseRequest = {
        reviewStatus: status,
        qualityScore: status === ReviewStatus.APPROVED ? qualityScore : undefined,
        reviewNotes: reviewNotes.trim() || undefined,
      };

      await reviewExercise(id, request);
      const statusText = status === ReviewStatus.APPROVED ? 'đã được duyệt' : 
                         status === ReviewStatus.REJECTED ? 'đã bị từ chối' : 
                         'đã được yêu cầu chỉnh sửa';
      showSuccess(`Bài tập ${statusText} thành công`);
      router.push(`/content/exercises/${id}`);
    } catch (error) {
      showError('Duyệt bài tập thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    } finally {
      setSubmittingStatus(null);
    }
  };

  if (exerciseLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (!exercise) {
    return <div className="text-center py-8">Không tìm thấy bài tập</div>;
  }

  if (exercise.reviewStatus !== ReviewStatus.PENDING) {
    // Show loading message while redirecting
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            Bài tập này đã được duyệt. Đang chuyển về danh sách bài tập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Duyệt bài tập</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Quay lại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Exercise Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Xem trước bài tập</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nội dung bài toán</label>
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
                <div className="mt-1 space-y-2">
                  {exercise.solutionSteps.map((step, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium text-gray-900 dark:text-white">
                        Bước {step.stepNumber}: {step.description || 'Không có mô tả'}
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 mt-1">
                        <MathText text={step.content} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Biểu mẫu duyệt</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Điểm chất lượng: {qualityScore.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={qualityScore}
                  onChange={(e) => setQualityScore(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0.0</span>
                  <span>0.5</span>
                  <span>1.0</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ghi chú duyệt
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Nhập ghi chú duyệt..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Thông tin bài tập</h2>
            <div className="space-y-3">
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
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Hành động duyệt</h2>
            <div className="space-y-3">
              <button
                onClick={() => handleSubmit(ReviewStatus.APPROVED)}
                disabled={submittingStatus !== null || qualityScore < 0.7}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingStatus === ReviewStatus.APPROVED && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {submittingStatus === ReviewStatus.APPROVED ? `Đang duyệt${loadingDots}` : 'Duyệt (Điểm ≥ 0.7)'}
              </button>
              <button
                onClick={() => handleSubmit(ReviewStatus.REJECTED)}
                disabled={submittingStatus !== null || !reviewNotes.trim()}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingStatus === ReviewStatus.REJECTED && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {submittingStatus === ReviewStatus.REJECTED ? `Đang từ chối${loadingDots}` : 'Từ chối (Cần ghi chú)'}
              </button>
              <button
                onClick={() => handleSubmit(ReviewStatus.NEEDS_REVISION)}
                disabled={submittingStatus !== null}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingStatus === ReviewStatus.NEEDS_REVISION && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {submittingStatus === ReviewStatus.NEEDS_REVISION ? `Đang yêu cầu chỉnh sửa${loadingDots}` : 'Yêu cầu chỉnh sửa'}
              </button>
            </div>
          </div>

          {reviewHistory && reviewHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Lịch sử duyệt</h2>
              <div className="space-y-3">
                {reviewHistory.map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg">
                    <ReviewStatusBadge status={log.reviewStatus} />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formatDateTime(log.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

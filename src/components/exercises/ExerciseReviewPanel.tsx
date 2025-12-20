/**
 * Exercise Review Panel Component
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExercise, useReviewHistory } from '@/lib/hooks/useExercises';
import { reviewExercise } from '@/lib/api/exercise.service';
import { ReviewExerciseRequest, ReviewStatus } from '@/types/exercise';
import ReviewStatusBadge from './ReviewStatusBadge';
import { formatDateTime } from '@/lib/utils/formatters';
import { showError, showSuccess } from '@/lib/utils/toast';

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
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (status: ReviewStatus) => {
    // Validation
    if (status === ReviewStatus.REJECTED && !reviewNotes.trim()) {
      showError('Review notes are required when rejecting an exercise');
      return;
    }

    if (status === ReviewStatus.APPROVED && qualityScore < 0.7) {
      showError('Quality score must be at least 0.7 to approve an exercise');
      return;
    }

    setSubmitting(true);

    try {
      const request: ReviewExerciseRequest = {
        reviewStatus: status,
        qualityScore: status === ReviewStatus.APPROVED ? qualityScore : undefined,
        reviewNotes: reviewNotes.trim() || undefined,
      };

      await reviewExercise(id, request);
      showSuccess(`Exercise ${status.toLowerCase()} successfully`);
      router.push(`/content/exercises/${id}`);
    } catch (error) {
      showError('Failed to review exercise: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (exerciseLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!exercise) {
    return <div className="text-center py-8">Exercise not found</div>;
  }

  if (exercise.reviewStatus !== ReviewStatus.PENDING) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            This exercise has already been reviewed. Current status: <ReviewStatusBadge status={exercise.reviewStatus} />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review Exercise</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Exercise Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Exercise Preview</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Problem Text</label>
                <div className="mt-1 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{exercise.problemText}</p>
                </div>
              </div>

              {exercise.problemImageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Problem Image
                  </label>
                  <img
                    src={exercise.problemImageUrl}
                    alt="Problem"
                    className="mt-1 max-w-md rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Solution Steps
                </label>
                <div className="mt-1 space-y-2">
                  {exercise.solutionSteps.map((step, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium text-gray-900 dark:text-white">
                        Step {step.stepNumber}: {step.description || 'No description'}
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 mt-1" dangerouslySetInnerHTML={{ __html: step.content }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Review Form</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quality Score: {qualityScore.toFixed(2)}
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
                  Review Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter review notes..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Exercise Info</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <div className="mt-1">
                  <ReviewStatusBadge status={exercise.reviewStatus} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grade</label>
                <p className="mt-1 text-gray-900 dark:text-white">{exercise.grade}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
                <p className="mt-1 text-gray-900 dark:text-white">{exercise.difficultyLevel || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Review Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => handleSubmit(ReviewStatus.APPROVED)}
                disabled={submitting || qualityScore < 0.7}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Approve (Score ≥ 0.7)
              </button>
              <button
                onClick={() => handleSubmit(ReviewStatus.REJECTED)}
                disabled={submitting || !reviewNotes.trim()}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject (Requires Notes)
              </button>
              <button
                onClick={() => handleSubmit(ReviewStatus.NEEDS_REVISION)}
                disabled={submitting}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Needs Revision
              </button>
            </div>
          </div>

          {reviewHistory && reviewHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Review History</h2>
              <div className="space-y-3">
                {reviewHistory.map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg">
                    <ReviewStatusBadge status={log.reviewStatus} />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formatDateTime(log.reviewedAt)}
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

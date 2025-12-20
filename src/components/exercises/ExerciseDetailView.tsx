/**
 * Exercise Detail View Component
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useExercise, useExerciseStats, useReviewHistory } from '@/lib/hooks/useExercises';
import ReviewStatusBadge from './ReviewStatusBadge';
import { formatDate, formatDateTime } from '@/lib/utils/formatters';
import { ReviewStatus } from '@/types/exercise';

interface ExerciseDetailViewProps {
  id: string;
}

export default function ExerciseDetailView({ id }: ExerciseDetailViewProps) {
  const router = useRouter();
  const { data: exercise, loading, error } = useExercise(id);
  const { data: stats } = useExerciseStats(id);
  const { data: reviewHistory } = useReviewHistory(id);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'stats'>('info');

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error || !exercise) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Error: {error?.message || 'Exercise not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exercise Details</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">ID: {exercise.id}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/content/exercises/${exercise.id}/edit`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Edit
          </Link>
          {exercise.reviewStatus === ReviewStatus.PENDING && (
            <Link
              href={`/content/exercises/${exercise.id}/review`}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Review
            </Link>
          )}
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Back
          </button>
        </div>
      </div>

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
            Information
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Review History
          </button>
          {exercise.reviewStatus === ReviewStatus.APPROVED && (
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Statistics
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quality Score</label>
                <p className="mt-1 text-gray-900 dark:text-white">{exercise.qualityScore?.toFixed(2) || '-'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Problem Text
              </label>
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
              <div className="mt-1 space-y-4">
                {exercise.solutionSteps.map((step, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="font-medium text-gray-900 dark:text-white mb-2">
                      Step {step.stepNumber}: {step.description || 'No description'}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 mb-2" dangerouslySetInnerHTML={{ __html: step.content }} />
                    {step.explanation && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 italic">{step.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Common Mistakes
                </label>
                <div className="mt-1 space-y-2">
                  {exercise.commonMistakes.map((mistake, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium text-gray-900 dark:text-white">{mistake.mistake}</div>
                      {mistake.explanation && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{mistake.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Created At</label>
                <p className="mt-1 text-gray-900 dark:text-white">{formatDateTime(exercise.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Updated At</label>
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
                        Reviewed by {log.reviewedBy} on {formatDateTime(log.reviewedAt)}
                      </p>
                    </div>
                    {log.qualityScore && (
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Score: {log.qualityScore.toFixed(2)}
                      </div>
                    )}
                  </div>
                  {log.reviewNotes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{log.reviewNotes}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No review history available</p>
            )}
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Attempts</label>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAttempts}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Success Rate</label>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {(stats.avgSuccessRate * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usage Count</label>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.usageCount}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Average Time</label>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {stats.avgTimeSec ? `${stats.avgTimeSec}s` : '-'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

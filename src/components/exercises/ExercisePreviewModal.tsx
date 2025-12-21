/**
 * Exercise Preview Modal Component
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Exercise, ReviewStatus } from '@/types/exercise';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import ReviewStatusBadge from './ReviewStatusBadge';
import { truncateText } from '@/lib/utils/formatters';
import { reviewExercise } from '@/lib/api/exercise.service';
import { showError, showSuccess } from '@/lib/utils/toast';

interface ExercisePreviewModalProps {
  isOpen: boolean;
  exercises: Exercise[];
  generationMetadata?: {
    providerUsed?: string;
    overallConfidence?: number;
    totalGenerated?: number;
    totalValid?: number;
  };
  onClose: () => void;
  onViewDetail: (exerciseId: string) => void;
  onBulkApprove?: (exerciseIds: string[]) => void;
  onBulkReject?: (exerciseIds: string[]) => void;
}

export default function ExercisePreviewModal({
  isOpen,
  exercises,
  generationMetadata,
  onClose,
  onViewDetail,
  onBulkApprove,
  onBulkReject,
}: ExercisePreviewModalProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleSelectAll = () => {
    if (selectedIds.size === exercises.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(exercises.map((e) => e.id)));
    }
  };

  const handleSelectExercise = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    setProcessingIds(new Set(ids));

    try {
      const promises = ids.map((id) =>
        reviewExercise(id, {
          reviewStatus: ReviewStatus.APPROVED,
          qualityScore: exercises.find((e) => e.id === id)?.qualityScore,
        })
      );

      await Promise.all(promises);
      showSuccess(`Đã duyệt ${ids.length} bài tập`);
      setSelectedIds(new Set());
      onBulkApprove?.(ids);
    } catch (error) {
      showError('Duyệt bài tập thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    } finally {
      setProcessingIds(new Set());
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    setProcessingIds(new Set(ids));

    try {
      const promises = ids.map((id) =>
        reviewExercise(id, {
          reviewStatus: ReviewStatus.REJECTED,
          reviewNotes: 'Từ chối từ preview modal',
        })
      );

      await Promise.all(promises);
      showSuccess(`Đã từ chối ${ids.length} bài tập`);
      setSelectedIds(new Set());
      onBulkReject?.(ids);
    } catch (error) {
      showError('Từ chối bài tập thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    } finally {
      setProcessingIds(new Set());
    }
  };

  const getProviderBadgeColor = (provider?: string) => {
    switch (provider?.toLowerCase()) {
      case 'gemini':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'huggingface':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'openai':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500';
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleViewAll = () => {
    if (exercises.length > 0) {
      const skillId = exercises[0].skillId;
      router.push(`/content/exercises?skillId=${skillId}&reviewStatus=PENDING`);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-6xl">
      <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Xem trước bài tập đã tạo
        </h2>

        {/* Metadata Header */}
        {generationMetadata && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
            <div className="flex flex-wrap gap-4 items-center">
              {generationMetadata.providerUsed && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Provider:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getProviderBadgeColor(
                      generationMetadata.providerUsed
                    )}`}
                  >
                    {generationMetadata.providerUsed.toUpperCase()}
                  </span>
                </div>
              )}
              {generationMetadata.overallConfidence !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Độ tin cậy tổng:
                  </span>
                  <span
                    className={`text-sm font-bold ${getConfidenceColor(
                      generationMetadata.overallConfidence
                    )}`}
                  >
                    {(generationMetadata.overallConfidence * 100).toFixed(1)}%
                  </span>
                </div>
              )}
              {generationMetadata.totalGenerated !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Đã tạo: {generationMetadata.totalValid || exercises.length} /{' '}
                    {generationMetadata.totalGenerated}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bulk Actions Toolbar */}
        {exercises.length > 0 && (
          <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.size === exercises.length && exercises.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Chọn tất cả</span>
              </label>
              {selectedIds.size > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Đã chọn {selectedIds.size} bài tập
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkApprove}
                disabled={selectedIds.size === 0 || processingIds.size > 0}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Duyệt đã chọn
              </button>
              <button
                onClick={handleBulkReject}
                disabled={selectedIds.size === 0 || processingIds.size > 0}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Từ chối đã chọn
              </button>
            </div>
          </div>
        )}

        {/* Preview Table */}
        {exercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Không có bài tập nào được tạo
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === exercises.length && exercises.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3">ID</TableCell>
                  <TableCell isHeader className="px-4 py-3">Nội dung bài toán</TableCell>
                  <TableCell isHeader className="px-4 py-3">Độ khó</TableCell>
                  <TableCell isHeader className="px-4 py-3">Độ tin cậy</TableCell>
                  <TableCell isHeader className="px-4 py-3">Trạng thái</TableCell>
                  <TableCell isHeader className="px-4 py-3">Thao tác</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exercises.map((exercise) => {
                  const isSelected = selectedIds.has(exercise.id);
                  const isProcessing = processingIds.has(exercise.id);
                  const confidence = exercise.qualityScore;

                  return (
                    <TableRow
                      key={exercise.id}
                      className={isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectExercise(exercise.id)}
                          disabled={isProcessing}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3 font-mono text-sm">
                        {truncateText(exercise.id, 8)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span
                          className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => onViewDetail(exercise.id)}
                        >
                          {truncateText(exercise.problemText, 60)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {exercise.difficultyLevel ? (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            {exercise.difficultyLevel}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {confidence !== undefined ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
                              {(confidence * 100).toFixed(0)}%
                            </span>
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  confidence >= 0.8
                                    ? 'bg-green-500'
                                    : confidence >= 0.5
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <ReviewStatusBadge status={exercise.reviewStatus} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <button
                          onClick={() => onViewDetail(exercise.id)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                          disabled={isProcessing}
                        >
                          Xem chi tiết
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleViewAll}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Xem tất cả bài tập đã tạo
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}


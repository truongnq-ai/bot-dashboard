/**
 * Exercise Generate Modal Component
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { GenerateExercisesRequest, Exercise } from '@/types/exercise';
import { generateExercises, generatePrompt } from '@/lib/api/exercise.service';
import { useSkills } from '@/lib/hooks/useSkills';
import { Skill } from '@/types/skill';
import { showError, showSuccess } from '@/lib/utils/toast';
import { BUTTON_LOADING_CONFIG } from '@/lib/config/ui.config';
import { setPromptContext } from '@/lib/utils/navigation';

interface ExerciseGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (
    exercises: Exercise[],
    metadata?: {
      providerUsed?: string;
      overallConfidence?: number;
      totalGenerated?: number;
      totalValid?: number;
    }
  ) => void;
  initialSkillId?: string;
  initialGrade?: number;
}

interface ExerciseGenerationStatus {
  index: number; // 1-based index
  status: 'pending' | 'generating' | 'success' | 'failed';
  exercise?: Exercise; // Nếu thành công
  error?: string; // Nếu thất bại
  retryCount?: number; // Số lần đã retry
}

export default function ExerciseGenerateModal({
  isOpen,
  onClose,
  onSuccess,
  initialSkillId,
  initialGrade,
}: ExerciseGenerateModalProps) {
  const [formData, setFormData] = useState<GenerateExercisesRequest>({
    skillId: initialSkillId || '',
    grade: initialGrade || 6,
    difficultyLevel: undefined,
    count: 5,
    promptTemplateId: undefined,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copyingPrompt, setCopyingPrompt] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingDots, setLoadingDots] = useState('.');
  const [copyPromptLoadingDots, setCopyPromptLoadingDots] = useState('.');

  // Sequential generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [exerciseStatuses, setExerciseStatuses] = useState<ExerciseGenerationStatus[]>([]);
  const [successfulExercises, setSuccessfulExercises] = useState<Exercise[]>([]);
  const [generationMetadata, setGenerationMetadata] = useState<{
    providerUsed?: string;
    overallConfidence?: number;
    totalGenerated?: number;
    totalValid?: number;
  } | null>(null);

  const { data: skillsData } = useSkills({
    grade: formData.grade as 6 | 7,
    pageSize: 1000,
    sortBy: 'code',
    sortDirection: 'asc',
  });

  // Sort skills by code alphabetically
  const sortedSkills = useMemo(() => {
    if (!skillsData?.content) return [];
    return [...skillsData.content].sort((a, b) => {
      return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [skillsData]);

  // Reset skillId when grade changes
  useEffect(() => {
    if (formData.skillId) {
      const selectedSkill = sortedSkills.find((s) => s.id === formData.skillId);
      if (selectedSkill && selectedSkill.grade !== formData.grade) {
        setFormData((prev) => ({ ...prev, skillId: '' }));
      }
    }
  }, [formData.grade, formData.skillId, sortedSkills]);

  // Animation for loading dots
  useEffect(() => {
    if (loading) {
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
  }, [loading]);

  // Animation for copy prompt loading dots
  useEffect(() => {
    if (copyingPrompt) {
      const interval = setInterval(() => {
        setCopyPromptLoadingDots((prev) => {
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          return '.';
        });
      }, BUTTON_LOADING_CONFIG.DOTS_ANIMATION_INTERVAL);

      return () => clearInterval(interval);
    } else {
      setCopyPromptLoadingDots('.');
    }
  }, [copyingPrompt]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.skillId) {
      newErrors.skillId = 'Vui lòng chọn kỹ năng';
    }

    if (!formData.grade || (formData.grade !== 6 && formData.grade !== 7)) {
      newErrors.grade = 'Lớp phải là 6 hoặc 7';
    }

    if (!formData.count || formData.count < 1 || formData.count > 20) {
      newErrors.count = 'Số lượng phải từ 1 đến 20';
    }

    if (formData.difficultyLevel && (formData.difficultyLevel < 1 || formData.difficultyLevel > 5)) {
      newErrors.difficultyLevel = 'Độ khó phải từ 1 đến 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Retry logic with exponential backoff
  const generateWithRetry = async (
    request: GenerateExercisesRequest,
    maxRetries: number = 2,
    onRetry?: (attempt: number) => void,
    generationIndex?: number
  ): Promise<{ exercise: Exercise | null; metadata?: { providerUsed?: string; overallConfidence?: number } }> => {
    // Generate unique nonce for this generation attempt
    const nonce = crypto.randomUUID();
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await generateExercises({ 
          ...request, 
          count: 1,
          nonce,
          generationIndex,
        });
        if (response.data?.exercises?.[0]) {
          return {
            exercise: response.data.exercises[0],
            metadata: {
              providerUsed: response.data.providerUsed,
              overallConfidence: response.data.overallConfidence,
            },
          };
        }
        throw new Error('No exercise returned');
      } catch (error) {
        if (attempt < maxRetries) {
          onRetry?.(attempt + 1);
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        // Hết retry, trả về null với error message
        return {
          exercise: null,
        };
      }
    }
    
    return { exercise: null };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Backward compatible: if count === 1, use original logic
    if (formData.count === 1) {
      setLoading(true);
      setErrors({});

      try {
        const response = await generateExercises(formData);
        
        if (response.data && response.data.exercises) {
          showSuccess(`Đã tạo thành công ${response.data.exercises.length} bài tập`);
          onSuccess(response.data.exercises, {
            providerUsed: response.data.providerUsed,
            overallConfidence: response.data.overallConfidence,
            totalGenerated: response.data.totalGenerated,
            totalValid: response.data.totalValid,
          });
          onClose();
        } else {
          showError('Không có bài tập nào được tạo');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        showError(`Tạo bài tập thất bại: ${errorMessage}`);
        setErrors({ submit: errorMessage });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Sequential generation for count > 1
    setIsGenerating(true);
    setErrors({});
    setSuccessfulExercises([]);
    setGenerationMetadata(null);

    // Initialize status tracking
    const totalCount = formData.count;
    const initialStatuses: ExerciseGenerationStatus[] = Array.from({ length: totalCount }, (_, i) => ({
      index: i + 1,
      status: 'pending',
      retryCount: 0,
    }));
    setExerciseStatuses(initialStatuses);

    const exercises: Exercise[] = [];
    let providerUsed: string | undefined;
    let overallConfidence: number | undefined;
    let totalGenerated = 0;
    let totalValid = 0;

    // Sequential generation loop
    for (let i = 0; i < totalCount; i++) {
      // Update status to generating
      setExerciseStatuses((prev) => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: 'generating', retryCount: 0 };
        return updated;
      });

      let retryCount = 0;
      const result = await generateWithRetry(
        formData,
        2,
        (attempt) => {
          retryCount = attempt;
          // Update retry count in status
          setExerciseStatuses((prev) => {
            const updated = [...prev];
            updated[i] = { ...updated[i], retryCount: attempt };
            return updated;
          });
        },
        i // generationIndex: 0-based index
      );
      
      if (result.exercise) {
        exercises.push(result.exercise);
        totalValid++;
        
        // Update status to success
        setExerciseStatuses((prev) => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: 'success',
            exercise: result.exercise!,
            retryCount,
          };
          return updated;
        });

        // Capture metadata from first successful exercise
        if (i === 0 && result.metadata) {
          providerUsed = result.metadata.providerUsed;
          overallConfidence = result.metadata.overallConfidence;
        }
      } else {
        // Failed after all retries
        const errorMessage = 'Không thể tạo bài tập sau khi retry';
        
        // Update status to failed
        setExerciseStatuses((prev) => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: 'failed',
            error: errorMessage,
            retryCount: 2, // Max retries attempted
          };
          return updated;
        });
        // Continue to next exercise (skip failed one)
      }

      totalGenerated++;
    }

    setIsGenerating(false);
    setSuccessfulExercises(exercises);

    // Handle completion
    if (exercises.length > 0) {
      // Calculate overall confidence if we have quality scores
      const confidences = exercises
        .map((e) => e.qualityScore)
        .filter((score): score is number => score !== undefined);
      const avgConfidence = confidences.length > 0
        ? confidences.reduce((sum, score) => sum + score, 0) / confidences.length
        : undefined;

      const metadata = {
        providerUsed: providerUsed || 'ai',
        overallConfidence: avgConfidence,
        totalGenerated,
        totalValid,
      };
      setGenerationMetadata(metadata);

      showSuccess(`Đã tạo thành công ${exercises.length}/${totalCount} bài tập`);
      onSuccess(exercises, metadata);
      onClose();
    } else {
      // All exercises failed
      showError(`Không thể tạo bài tập nào (${totalCount} bài đều thất bại)`);
      setErrors({ submit: 'Tất cả bài tập đều thất bại sau khi retry' });
    }
  };

  const handleCopyPrompt = async () => {
    // Validate required fields for prompt generation
    if (!formData.skillId) {
      showError('Vui lòng chọn kỹ năng');
      return;
    }

    if (!formData.grade || (formData.grade !== 6 && formData.grade !== 7)) {
      showError('Vui lòng chọn lớp (6 hoặc 7)');
      return;
    }

    setCopyingPrompt(true);
    setErrors({});

    try {
      const response = await generatePrompt({
        skillId: formData.skillId,
        grade: formData.grade,
        difficultyLevel: formData.difficultyLevel,
      });

      if (response.data && response.data.prompt) {
        // Save prompt context (skillId, grade, difficultyLevel) to sessionStorage
        setPromptContext({
          skillId: formData.skillId,
          grade: formData.grade,
          difficultyLevel: formData.difficultyLevel,
        });

        // Copy to clipboard
        await navigator.clipboard.writeText(response.data.prompt);
        showSuccess('Đã copy prompt vào clipboard');
      } else {
        showError('Không thể tạo prompt');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      showError(`Không thể tạo prompt: ${errorMessage}`);
    } finally {
      setCopyingPrompt(false);
    }
  };

  const handleClose = () => {
    if (!loading && !copyingPrompt && !isGenerating) {
      setFormData({
        skillId: initialSkillId || '',
        grade: initialGrade || 6,
        difficultyLevel: undefined,
        count: 5,
        promptTemplateId: undefined,
      });
      setErrors({});
      setShowAdvanced(false);
      setIsGenerating(false);
      setExerciseStatuses([]);
      setSuccessfulExercises([]);
      setGenerationMetadata(null);
      onClose();
    }
  };

  // Calculate progress
  const completedCount = exerciseStatuses.filter(
    (status) => status.status === 'success' || status.status === 'failed'
  ).length;
  const totalCount = exerciseStatuses.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const successCount = exerciseStatuses.filter((status) => status.status === 'success').length;
  const failedCount = exerciseStatuses.filter((status) => status.status === 'failed').length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Tạo bài tập với AI
        </h2>

        {/* Progress Tracking UI */}
        {isGenerating && exerciseStatuses.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tiến độ: {completedCount}/{totalCount} bài tập
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Status List */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
              <div className="space-y-2">
                {exerciseStatuses.map((status) => {
                  let statusColor = '';
                  let statusText = '';
                  let statusIcon = '';

                  switch (status.status) {
                    case 'pending':
                      statusColor = 'text-gray-500 dark:text-gray-400';
                      statusText = 'Chờ xử lý';
                      statusIcon = '⏳';
                      break;
                    case 'generating':
                      statusColor = 'text-yellow-600 dark:text-yellow-400';
                      statusText = 'Đang tạo...';
                      statusIcon = '🟡';
                      break;
                    case 'success':
                      statusColor = 'text-green-600 dark:text-green-400';
                      statusText = 'Thành công';
                      statusIcon = '🟢';
                      break;
                    case 'failed':
                      statusColor = 'text-red-600 dark:text-red-400';
                      statusText = 'Thất bại';
                      statusIcon = '🔴';
                      break;
                  }

                  return (
                    <div
                      key={status.index}
                      className={`flex items-center justify-between p-2 rounded ${
                        status.status === 'generating'
                          ? 'bg-yellow-50 dark:bg-yellow-900/20'
                          : status.status === 'success'
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : status.status === 'failed'
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{statusIcon}</span>
                        <span className={`text-sm font-medium ${statusColor}`}>
                          Bài tập {status.index}: {statusText}
                        </span>
                        {status.retryCount !== undefined && status.retryCount > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            (Đã retry {status.retryCount} lần)
                          </span>
                        )}
                      </div>
                      {status.error && (
                        <span className="text-xs text-red-600 dark:text-red-400 truncate max-w-xs" title={status.error}>
                          {status.error}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400">🟢</span>
                <span className="text-gray-700 dark:text-gray-300">Thành công: {successCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600 dark:text-red-400">🔴</span>
                <span className="text-gray-700 dark:text-gray-300">Thất bại: {failedCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-600 dark:text-yellow-400">🟡</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Đang xử lý: {totalCount - completedCount}
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Grade Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lớp <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.grade
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              value={formData.grade}
              onChange={(e) => {
                const newGrade = parseInt(e.target.value);
                setFormData({ ...formData, grade: newGrade, skillId: '' }); // Reset skill when grade changes
              }}
              disabled={loading || copyingPrompt || isGenerating}
            >
              <option value={6}>Lớp 6</option>
              <option value={7}>Lớp 7</option>
            </select>
            {errors.grade && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.grade}</p>
            )}
          </div>

          {/* Skill Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kỹ năng <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.skillId
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              value={formData.skillId}
              onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
              disabled={loading || copyingPrompt || isGenerating}
            >
              <option value="">Chọn kỹ năng</option>
              {sortedSkills.map((skill: Skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.code} - {skill.name}
                </option>
              ))}
            </select>
            {errors.skillId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.skillId}</p>
            )}
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Độ khó
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.difficultyLevel
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              value={formData.difficultyLevel || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  difficultyLevel: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              disabled={loading || copyingPrompt || isGenerating}
            >
              <option value="">AI tự đề xuất</option>
              <option value={1}>1 - Rất dễ</option>
              <option value={2}>2 - Dễ</option>
              <option value={3}>3 - Trung bình</option>
              <option value={4}>4 - Khó</option>
              <option value={5}>5 - Rất khó</option>
            </select>
            {errors.difficultyLevel && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.difficultyLevel}</p>
            )}
          </div>

          {/* Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Số lượng bài tập <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="20"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.count
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              value={formData.count}
              onChange={(e) =>
                setFormData({ ...formData, count: parseInt(e.target.value) || 1 })
              }
              disabled={loading || copyingPrompt || isGenerating}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Số lượng từ 1 đến 20 bài tập
            </p>
            {errors.count && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.count}</p>
            )}
          </div>

          {/* Advanced Options */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showAdvanced ? '▼' : '▶'} Tùy chọn nâng cao
            </button>

            {showAdvanced && (
              <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prompt Template ID (tùy chọn)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.promptTemplateId || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, promptTemplateId: e.target.value || undefined })
                    }
                    placeholder="Để trống để dùng template mặc định"
                    disabled={loading || copyingPrompt || isGenerating}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Để trống để sử dụng prompt template mặc định cho lớp {formData.grade}
                  </p>
                </div>
              </div>
            )}
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || copyingPrompt || isGenerating}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleCopyPrompt}
              disabled={loading || copyingPrompt || isGenerating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {copyingPrompt && (
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
              {copyingPrompt ? `Đang tạo${copyPromptLoadingDots}` : 'Copy Prompt'}
            </button>
            <button
              type="submit"
              disabled={loading || copyingPrompt || isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {(loading || isGenerating) && (
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
              {isGenerating
                ? `Đang tạo${loadingDots} (${completedCount}/${totalCount})`
                : loading
                ? `Đang tạo${loadingDots}`
                : 'Tạo bài tập'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}


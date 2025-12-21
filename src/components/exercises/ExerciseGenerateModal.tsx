/**
 * Exercise Generate Modal Component
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { GenerateExercisesRequest, Exercise } from '@/types/exercise';
import { generateExercises } from '@/lib/api/exercise.service';
import { useSkills } from '@/lib/hooks/useSkills';
import { Skill } from '@/types/skill';
import { showError, showSuccess } from '@/lib/utils/toast';

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: skillsData } = useSkills({ pageSize: 100 });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

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
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        skillId: initialSkillId || '',
        grade: initialGrade || 6,
        difficultyLevel: undefined,
        count: 5,
        promptTemplateId: undefined,
      });
      setErrors({});
      setShowAdvanced(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Tạo bài tập với AI
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={loading}
            >
              <option value="">Chọn kỹ năng</option>
              {skillsData?.content?.map((skill: Skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name} ({skill.code})
                </option>
              ))}
            </select>
            {errors.skillId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.skillId}</p>
            )}
          </div>

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
              onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
              disabled={loading}
            >
              <option value={6}>Lớp 6</option>
              <option value={7}>Lớp 7</option>
            </select>
            {errors.grade && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.grade}</p>
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
              disabled={loading}
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
              disabled={loading}
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
                    disabled={loading}
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
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tạo...' : 'Tạo bài tập'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}


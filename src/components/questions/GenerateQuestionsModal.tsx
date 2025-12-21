/**
 * Generate Questions Modal Component
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { GenerateQuestionRequest, QuestionType } from '@/types/question';
import { generateQuestions } from '@/lib/api/question.service';
import { useSkills } from '@/lib/hooks/useSkills';
import { useExercises } from '@/lib/hooks/useExercises';
import { ReviewStatus } from '@/types/exercise';
import { handleApiError, handleApiSuccess } from '@/lib/utils/errorHandler';

interface GenerateQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GenerateQuestionsModal({
  isOpen,
  onClose,
  onSuccess,
}: GenerateQuestionsModalProps) {
  const [formData, setFormData] = useState<GenerateQuestionRequest>({
    skillId: undefined,
    studentId: undefined,
    exerciseId: undefined,
    difficultyLevel: undefined,
    count: 5,
    questionType: QuestionType.PRACTICE,
    sessionId: undefined,
  });

  const [assignToStudent, setAssignToStudent] = useState(false);
  const [generateFromExercise, setGenerateFromExercise] = useState(false);
  const [generateFromSkill, setGenerateFromSkill] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch skills and exercises
  const { data: skillsData } = useSkills({ pageSize: 100 });
  const { data: exercisesData } = useExercises({
    reviewStatus: ReviewStatus.APPROVED,
    pageSize: 100,
  });

  // Update count when exercise is selected
  useEffect(() => {
    if (generateFromExercise && formData.exerciseId) {
      // Exercise generates 1 question, so if both selected, count = 1 + remaining
      if (generateFromSkill) {
        // Keep count as is (user input for skill part)
      } else {
        // Only exercise, count should be 1
        setFormData((prev) => ({ ...prev, count: 1 }));
      }
    }
  }, [generateFromExercise, formData.exerciseId, generateFromSkill]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // At least one of exercise or skill must be selected
    if (!generateFromExercise && !generateFromSkill) {
      newErrors.source = 'Phải chọn ít nhất một trong: Bài tập hoặc Kỹ năng';
    }

    // If only skill selected, count is required
    if (generateFromSkill && !generateFromExercise) {
      if (!formData.count || formData.count < 1 || formData.count > 20) {
        newErrors.count = 'Số lượng phải từ 1 đến 20';
      }
    }

    // If exercise selected, exerciseId is required
    if (generateFromExercise && !formData.exerciseId) {
      newErrors.exerciseId = 'Vui lòng chọn bài tập';
    }

    // If skill selected, skillId is required
    if (generateFromSkill && !formData.skillId) {
      newErrors.skillId = 'Vui lòng chọn kỹ năng';
    }

    // If assign to student, studentId is required (for now, skip this validation as student API not ready)
    // if (assignToStudent && !formData.studentId) {
    //   newErrors.studentId = 'Vui lòng chọn học sinh';
    // }

    // Difficulty level validation
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

    try {
      setLoading(true);
      
      // Prepare request
      const request: GenerateQuestionRequest = {
        exerciseId: generateFromExercise ? formData.exerciseId : undefined,
        skillId: generateFromSkill ? formData.skillId : undefined,
        studentId: assignToStudent ? formData.studentId : undefined,
        difficultyLevel: formData.difficultyLevel || undefined,
        count: generateFromSkill ? formData.count : undefined,
        questionType: formData.questionType || QuestionType.PRACTICE,
        sessionId: formData.sessionId || undefined,
      };

      const response = await generateQuestions(request);
      
      if (response.errorCode === '0000' && response.data) {
        const count = response.data.length;
        handleApiSuccess(`Đã sinh ${count} câu hỏi thành công`);
        onSuccess?.();
        onClose();
        // Reset form
        setFormData({
          skillId: undefined,
          studentId: undefined,
          exerciseId: undefined,
          difficultyLevel: undefined,
          count: 5,
          questionType: QuestionType.PRACTICE,
          sessionId: undefined,
        });
        setAssignToStudent(false);
        setGenerateFromExercise(false);
        setGenerateFromSkill(false);
        setErrors({});
      } else {
        // Handle non-success response - pass response object directly
        handleApiError(response, response.errorDetail || 'Không thể sinh câu hỏi');
      }
    } catch (error) {
      handleApiError(error, 'Hệ thống không có phản hồi');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setErrors({});
    }
  };

  const skills = skillsData?.content || [];
  const exercises = exercisesData?.content || [];

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sinh câu hỏi</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Assignment */}
          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={assignToStudent}
                onChange={(e) => {
                  setAssignToStudent(e.target.checked);
                  if (!e.target.checked) {
                    setFormData((prev) => ({ ...prev, studentId: undefined }));
                  }
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Assign cho học sinh?
              </span>
            </label>
            {assignToStudent && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Nhập ID học sinh (tạm thời - API chưa sẵn sàng)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.studentId || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, studentId: e.target.value || undefined }))}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Tính năng chọn học sinh từ danh sách sẽ được thêm sau
                </p>
              </div>
            )}
          </div>

          {/* Source Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nguồn sinh câu hỏi <span className="text-red-500">*</span>
            </label>
            
            {/* Generate from Exercise */}
            <div className="mb-3">
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={generateFromExercise}
                  onChange={(e) => {
                    setGenerateFromExercise(e.target.checked);
                    if (!e.target.checked) {
                      setFormData((prev) => ({ ...prev, exerciseId: undefined }));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sinh từ bài tập cụ thể
                </span>
              </label>
              {generateFromExercise && (
                <select
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.exerciseId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  value={formData.exerciseId || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, exerciseId: e.target.value || undefined }))}
                >
                  <option value="">Chọn bài tập...</option>
                  {exercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.problemText.substring(0, 50)}... (ID: {exercise.id.substring(0, 8)})
                    </option>
                  ))}
                </select>
              )}
              {errors.exerciseId && (
                <p className="mt-1 text-sm text-red-500">{errors.exerciseId}</p>
              )}
            </div>

            {/* Generate from Skill */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={generateFromSkill}
                  onChange={(e) => {
                    setGenerateFromSkill(e.target.checked);
                    if (!e.target.checked) {
                      setFormData((prev) => ({ ...prev, skillId: undefined }));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sinh từ kỹ năng
                </span>
              </label>
              {generateFromSkill && (
                <select
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.skillId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  value={formData.skillId || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, skillId: e.target.value || undefined }))}
                >
                  <option value="">Chọn kỹ năng...</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.code} - {skill.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.skillId && (
                <p className="mt-1 text-sm text-red-500">{errors.skillId}</p>
              )}
            </div>

            {errors.source && (
              <p className="mt-2 text-sm text-red-500">{errors.source}</p>
            )}
          </div>

          {/* Generation Options */}
          <div className="space-y-4">
            {/* Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Số lượng câu hỏi
                {generateFromExercise && !generateFromSkill && (
                  <span className="text-xs text-gray-500 ml-2">(Tự động = 1 khi chọn bài tập)</span>
                )}
                {generateFromSkill && !generateFromExercise && (
                  <span className="text-red-500"> *</span>
                )}
                {generateFromExercise && generateFromSkill && (
                  <span className="text-xs text-gray-500 ml-2">(1 từ bài tập + số còn lại từ kỹ năng)</span>
                )}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.count ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                value={formData.count || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1 && value <= 20) {
                    setFormData((prev) => ({ ...prev, count: value }));
                  } else if (e.target.value === '') {
                    setFormData((prev) => ({ ...prev, count: undefined }));
                  }
                }}
                disabled={generateFromExercise && !generateFromSkill}
              />
              {errors.count && <p className="mt-1 text-sm text-red-500">{errors.count}</p>}
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Độ khó (tùy chọn)
              </label>
              <select
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.difficultyLevel ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                value={formData.difficultyLevel || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    difficultyLevel: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
              >
                <option value="">Tất cả</option>
                <option value="1">1 - Rất dễ</option>
                <option value="2">2 - Dễ</option>
                <option value="3">3 - Trung bình</option>
                <option value="4">4 - Khó</option>
                <option value="5">5 - Rất khó</option>
              </select>
              {errors.difficultyLevel && (
                <p className="mt-1 text-sm text-red-500">{errors.difficultyLevel}</p>
              )}
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Loại câu hỏi
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={formData.questionType || QuestionType.PRACTICE}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    questionType: e.target.value as QuestionType,
                  }))
                }
              >
                <option value={QuestionType.PRACTICE}>Luyện tập</option>
                <option value={QuestionType.MINI_TEST}>Mini Test</option>
                <option value={QuestionType.REVIEW}>Ôn tập</option>
              </select>
            </div>

            {/* Session ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Session ID (tùy chọn)
              </label>
              <input
                type="text"
                placeholder="UUID của session"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={formData.sessionId || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sessionId: e.target.value || undefined,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang sinh...' : 'Sinh câu hỏi'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}


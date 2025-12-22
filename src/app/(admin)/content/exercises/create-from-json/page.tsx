/**
 * Create Exercise from JSON Page
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CreateExerciseRequest } from '@/types/exercise';
import { validateExerciseJson } from '@/lib/utils/json-validator';
import { setExerciseDataFromJson, getPromptContext, clearPromptContext } from '@/lib/utils/navigation';
import { showError, showSuccess } from '@/lib/utils/toast';
import { useSkills } from '@/lib/hooks/useSkills';
import { useGrades } from '@/lib/hooks/useGrades';
import { Skill } from '@/types/skill';

export default function CreateFromJsonPage() {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [validatedExercise, setValidatedExercise] = useState<CreateExerciseRequest | null>(null);
  
  // Skill and Grade selection state
  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [selectedDifficultyLevel, setSelectedDifficultyLevel] = useState<number | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: gradesData } = useGrades();
  const { data: skillsData } = useSkills({
    grade: selectedGrade as 6 | 7 | undefined,
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

  // Check sessionStorage for prompt context on mount
  useEffect(() => {
    const promptContext = getPromptContext();
    if (promptContext) {
      setSelectedGrade(promptContext.grade);
      setSelectedSkillId(promptContext.skillId);
      setSelectedDifficultyLevel(promptContext.difficultyLevel);
      showSuccess('Đã tải thông tin từ prompt (có thể chỉnh sửa)');
    }
  }, []);

  // Reset skillId when grade changes
  useEffect(() => {
    if (selectedGrade) {
      const selectedSkill = sortedSkills.find((s) => s.id === selectedSkillId);
      if (selectedSkill && selectedSkill.grade !== selectedGrade) {
        setSelectedSkillId('');
      }
    }
  }, [selectedGrade, selectedSkillId, sortedSkills]);

  const handleValidate = () => {
    if (!jsonInput.trim()) {
      setValidationErrors(['Vui lòng nhập JSON']);
      setIsValidated(false);
      return;
    }

    const result = validateExerciseJson(jsonInput);

    if (result.valid && result.exercise) {
      setValidationErrors([]);
      setIsValidated(true);
      setValidatedExercise(result.exercise);
      showSuccess('JSON hợp lệ! Bạn có thể tạo bài tập.');
    } else {
      setValidationErrors(result.errors);
      setIsValidated(false);
      setValidatedExercise(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedSkillId) {
      errors.skillId = 'Vui lòng chọn kỹ năng';
    }

    if (!selectedGrade || (selectedGrade !== 6 && selectedGrade !== 7)) {
      errors.grade = 'Lớp phải là 6 hoặc 7';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateExercise = () => {
    // Validate JSON first
    if (!isValidated || !validatedExercise) {
      handleValidate();
      if (!isValidated || !validatedExercise) {
        return;
      }
    }

    // Validate Skill + Grade
    if (!validateForm()) {
      showError('Vui lòng chọn đầy đủ thông tin Kỹ năng và Lớp');
      return;
    }

    // Merge exercise data with selected skillId and grade
    const exerciseWithContext: CreateExerciseRequest = {
      ...validatedExercise,
      skillId: selectedSkillId,
      grade: selectedGrade,
      difficultyLevel: selectedDifficultyLevel || validatedExercise.difficultyLevel,
    };

    // Clear prompt context after use
    clearPromptContext();

    // Save to sessionStorage and navigate
    setExerciseDataFromJson(exerciseWithContext);
    router.push('/content/exercises/create');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tạo bài tập từ JSON</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Hủy
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nhập JSON từ AI Provider
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setIsValidated(false);
                setValidationErrors([]);
              }}
              spellCheck={false}
              className={`w-full h-96 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm ${
                validationErrors.length > 0
                  ? 'border-red-500'
                  : isValidated
                    ? 'border-green-500'
                    : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder='{"exercises": [{"problemText": "...", "solutionSteps": [...], ...}]}'
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Dán JSON kết quả từ AI provider. JSON phải có cấu trúc với mảng "exercises" chứa 1 bài tập.
            </p>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Lỗi validation:</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Message */}
          {isValidated && validationErrors.length === 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ JSON hợp lệ! Vui lòng chọn Kỹ năng và Lớp bên dưới.
              </p>
            </div>
          )}

          {/* Skill and Grade Selection Form */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Thông tin bài tập
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lớp <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    const newGrade = parseInt(e.target.value);
                    setSelectedGrade(newGrade);
                    setSelectedSkillId(''); // Reset skill when grade changes
                    setFormErrors({});
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    formErrors.grade
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {gradesData?.map((grade) => (
                    <option key={grade} value={grade}>
                      Lớp {grade}
                    </option>
                  ))}
                </select>
                {formErrors.grade && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.grade}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kỹ năng <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => {
                    setSelectedSkillId(e.target.value);
                    setFormErrors({});
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    formErrors.skillId
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Chọn kỹ năng</option>
                  {sortedSkills.map((skill: Skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.code} - {skill.name}
                    </option>
                  ))}
                </select>
                {formErrors.skillId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.skillId}</p>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {selectedSkillId
                ? 'Thông tin đã được tự động điền từ prompt (có thể chỉnh sửa)'
                : 'Vui lòng chọn kỹ năng phù hợp với bài tập'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleValidate}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Kiểm tra
            </button>
            <button
              type="button"
              onClick={handleCreateExercise}
              disabled={!isValidated || validationErrors.length > 0 || !selectedSkillId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Tạo bài tập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


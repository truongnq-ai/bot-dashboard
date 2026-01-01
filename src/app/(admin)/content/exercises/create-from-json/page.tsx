/**
 * Create Exercise from JSON Page
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ImportExerciseJsonRequest } from '@/types/exercise';
import { importExerciseFromJson, validateExerciseJson } from '@/lib/api/exercise.service';
import { showError, showSuccess } from '@/lib/utils/toast';
import { useSkills } from '@/lib/hooks/useSkills';
import { useGrades } from '@/lib/hooks/useGrades';
import { getChaptersByGrade } from '@/lib/api/chapter.service';
import { Skill } from '@/types/skill';
import { Chapter } from '@/types/chapter';

export default function CreateFromJsonPage() {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  
  // Chapter, Skill, and Difficulty selection state
  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedChapterCode, setSelectedChapterCode] = useState<string>('');
  const [selectedSkillCode, setSelectedSkillCode] = useState<string>('');
  const [selectedDifficultyLevel, setSelectedDifficultyLevel] = useState<number>(3);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [autoFillWarnings, setAutoFillWarnings] = useState<string[]>([]);

  const { data: gradesData, loading: gradesLoading } = useGrades();
  const { data: skillsData } = useSkills({
    grade: selectedGrade as 6 | 7 | undefined,
    pageSize: 1000,
    sortBy: 'code',
    sortDirection: 'asc',
  });

  // Fetch chapters by grade
  useEffect(() => {
    const fetchChapters = async () => {
      if (selectedGrade) {
        setChaptersLoading(true);
        try {
          const response = await getChaptersByGrade(selectedGrade as 6 | 7);
          if (response.errorCode === '0000' && response.data) {
            setChapters(response.data);
          }
        } catch (error) {
          console.error('Failed to fetch chapters:', error);
        } finally {
          setChaptersLoading(false);
        }
      }
    };
    fetchChapters();
  }, [selectedGrade]);

  // Sort skills by code alphabetically
  const sortedSkills = useMemo(() => {
    if (!skillsData?.content) return [];
    return [...skillsData.content].sort((a, b) => {
      return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [skillsData]);

  // Reset chapterCode and skillCode when grade changes
  useEffect(() => {
    setSelectedChapterCode('');
    setSelectedSkillCode('');
  }, [selectedGrade]);

  // Fix JSON escape errors (\{ and \} are invalid in JSON)
  const fixJsonEscape = (jsonString: string): { fixed: string; warnings: string[] } => {
    const warnings: string[] = [];
    let fixed = jsonString;
    
    // Fix: \{ → \\{ (nếu trong string context, không phải đã escape)
    // Pattern: match \{ or \} that are not already escaped (negative lookbehind)
    const invalidEscapePattern = /(?<!\\)\\([{}])/g;
    const matches = jsonString.match(invalidEscapePattern);
    if (matches && matches.length > 0) {
      warnings.push(`Đã tự động sửa ${matches.length} ký tự escape không hợp lệ (\\{ hoặc \\})`);
      fixed = jsonString.replace(invalidEscapePattern, '\\\\$1');
    }
    
    return { fixed, warnings };
  };

  // Auto-fill form from JSON
  useEffect(() => {
    if (!jsonInput.trim()) {
      setAutoFillWarnings([]);
      return;
    }

    let jsonToParse = jsonInput;
    const warnings: string[] = [];

    // Try parse JSON
    try {
      JSON.parse(jsonInput);
    } catch (e) {
      // If parse fails, try auto-fix
      const { fixed, warnings: fixWarnings } = fixJsonEscape(jsonInput);
      warnings.push(...fixWarnings);
      
      try {
        JSON.parse(fixed);
        jsonToParse = fixed;
        // Update jsonInput with fixed JSON
        setJsonInput(fixed);
        warnings.push('JSON đã được tự động sửa. Vui lòng kiểm tra lại.');
      } catch (e2) {
        // Still invalid, can't auto-fill
        setAutoFillWarnings([]);
        return;
      }
    }

    try {
      const parsed = JSON.parse(jsonToParse);

      // Extract và auto-fill chapterCode
      if (parsed.chapterCode && typeof parsed.chapterCode === 'string') {
        const jsonChapterCode = parsed.chapterCode.trim();
        
        // Check nếu user đã chọn khác
        if (selectedChapterCode && selectedChapterCode !== jsonChapterCode) {
          warnings.push(`JSON có chapterCode "${jsonChapterCode}" nhưng bạn đã chọn "${selectedChapterCode}". Giá trị trong form sẽ được sử dụng.`);
        } else if (!selectedChapterCode || selectedChapterCode === '') {
          // Chỉ auto-fill nếu form đang trống
          setSelectedChapterCode(jsonChapterCode);
          
          // Validate async: check xem chapterCode có trong grade hiện tại không
          if (selectedGrade && chapters.length > 0) {
            const chapterExists = chapters.some(c => c.code === jsonChapterCode);
            if (!chapterExists) {
              warnings.push(`ChapterCode "${jsonChapterCode}" không tìm thấy trong lớp ${selectedGrade}. Vui lòng kiểm tra lại.`);
            }
          }
        }
      }

      // Extract và auto-fill skillCode
      if (parsed.skillCode && typeof parsed.skillCode === 'string') {
        const jsonSkillCode = parsed.skillCode.trim();
        
        // Check nếu user đã chọn khác
        if (selectedSkillCode && selectedSkillCode !== jsonSkillCode) {
          warnings.push(`JSON có skillCode "${jsonSkillCode}" nhưng bạn đã chọn "${selectedSkillCode}". Giá trị trong form sẽ được sử dụng.`);
        } else if (!selectedSkillCode || selectedSkillCode === '') {
          // Chỉ auto-fill nếu form đang trống
          setSelectedSkillCode(jsonSkillCode);
          
          // Validate async: check xem skillCode có trong grade hiện tại không
          if (selectedGrade && sortedSkills.length > 0) {
            const skillExists = sortedSkills.some(s => s.code === jsonSkillCode);
            if (!skillExists) {
              warnings.push(`SkillCode "${jsonSkillCode}" không tìm thấy trong lớp ${selectedGrade}. Vui lòng kiểm tra lại.`);
            }
          }
        }
      }

      // Extract và auto-fill difficultyLevel
      if (parsed.difficultyLevel && typeof parsed.difficultyLevel === 'number') {
        const jsonDifficulty = parsed.difficultyLevel;
        if (jsonDifficulty >= 1 && jsonDifficulty <= 5) {
          // Chỉ update nếu khác với giá trị hiện tại
          if (selectedDifficultyLevel !== jsonDifficulty) {
            setSelectedDifficultyLevel(jsonDifficulty);
          }
        }
      }

      setAutoFillWarnings(warnings);
    } catch (e) {
      // Ignore parse errors, user will fix
      setAutoFillWarnings([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonInput, selectedGrade, chapters, sortedSkills]);

  const handleValidate = async () => {
    if (!jsonInput.trim()) {
      setValidationErrors(['Vui lòng nhập JSON']);
      setIsValidated(false);
      return;
    }

    setValidationErrors([]);
    setIsValidated(false);

    // Tier 1: Frontend - Validate JSON format
    let jsonToValidate = jsonInput;
    const warnings: string[] = [];

    try {
      JSON.parse(jsonInput);
    } catch (error) {
      // Try auto-fix
      const { fixed, warnings: fixWarnings } = fixJsonEscape(jsonInput);
      warnings.push(...fixWarnings);
      
      try {
        JSON.parse(fixed);
        jsonToValidate = fixed;
        // Update jsonInput with fixed JSON
        setJsonInput(fixed);
        warnings.push('JSON đã được tự động sửa. Vui lòng kiểm tra lại.');
      } catch (e2) {
        setValidationErrors(['JSON không hợp lệ: ' + (error instanceof Error ? error.message : 'Lỗi không xác định')]);
        setIsValidated(false);
        setAutoFillWarnings(warnings);
        return;
      }
    }

    // Parse và validate structure
    let parsed;
    try {
      parsed = JSON.parse(jsonToValidate);
    } catch (e) {
      setValidationErrors(['JSON không hợp lệ: ' + (e instanceof Error ? e.message : 'Lỗi không xác định')]);
      setIsValidated(false);
      setAutoFillWarnings(warnings);
      return;
    }

    // Check structure
    if (!parsed.exercises || !Array.isArray(parsed.exercises) || parsed.exercises.length === 0) {
      setValidationErrors(['JSON phải có mảng "exercises" chứa ít nhất 1 bài tập']);
      setIsValidated(false);
      setAutoFillWarnings(warnings);
      return;
    }

    const exercise = parsed.exercises[0];
    if (!exercise.problemText || !exercise.solutionSteps) {
      setValidationErrors(['Bài tập phải có "problemText" và "solutionSteps"']);
      setIsValidated(false);
      setAutoFillWarnings(warnings);
      return;
    }

    // Tier 2: Backend - Validate JSON schema + LaTeX
    try {
      setValidating(true);
      
      // Inject metadata for validation
      const jsonWithMetadata = {
        ...parsed,
        chapterCode: selectedChapterCode || parsed.chapterCode || '',
        skillCode: selectedSkillCode || parsed.skillCode || '',
        difficultyLevel: selectedDifficultyLevel || parsed.difficultyLevel || 3,
      };

      const jsonString = JSON.stringify(jsonWithMetadata);
      
      // Call backend validate endpoint
      const response = await validateExerciseJson({ rawExerciseJson: jsonString });
      
      if (response.errorCode === '0000') {
        setValidationErrors([]);
        setIsValidated(true);
        setAutoFillWarnings(warnings);
        showSuccess('JSON hợp lệ! Bạn có thể tạo bài tập.');
      } else {
        setValidationErrors([response.errorDetail || 'Validation failed']);
        setIsValidated(false);
        setAutoFillWarnings(warnings);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      setValidationErrors(['Validation thất bại: ' + errorMessage]);
      setIsValidated(false);
      setAutoFillWarnings(warnings);
    } finally {
      setValidating(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedChapterCode) {
      errors.chapterCode = 'Vui lòng chọn chương';
    }

    if (!selectedSkillCode) {
      errors.skillCode = 'Vui lòng chọn kỹ năng';
    }

    if (!selectedGrade || (selectedGrade !== 6 && selectedGrade !== 7)) {
      errors.grade = 'Lớp phải là 6 hoặc 7';
    }

    if (!selectedDifficultyLevel || selectedDifficultyLevel < 1 || selectedDifficultyLevel > 5) {
      errors.difficultyLevel = 'Độ khó phải từ 1 đến 5';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateExercise = async () => {
    // Validate JSON first
    if (!isValidated) {
      handleValidate();
      if (!isValidated) {
        return;
      }
    }

    // Validate Chapter, Skill, and Difficulty
    if (!validateForm()) {
      showError('Vui lòng chọn đầy đủ thông tin Chương, Kỹ năng và Độ khó');
      return;
    }

    setSubmitting(true);

    try {
      // Parse JSON and inject metadata at root level
      const parsedJson = JSON.parse(jsonInput);
      
      // Inject chapterCode, skillCode, difficultyLevel at root level
      const jsonWithMetadata = {
        ...parsedJson,
        chapterCode: selectedChapterCode,
        skillCode: selectedSkillCode,
        difficultyLevel: selectedDifficultyLevel,
      };

      // Convert back to JSON string
      const jsonString = JSON.stringify(jsonWithMetadata);

      // Call import API directly
      const request: ImportExerciseJsonRequest = {
        rawExerciseJson: jsonString,
      };

      await importExerciseFromJson(request);
      showSuccess('Tạo bài tập từ JSON thành công');
      router.push('/content/exercises');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      showError('Tạo bài tập thất bại: ' + errorMessage);
    } finally {
      setSubmitting(false);
    }
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

          {/* Auto-fill Warnings */}
          {autoFillWarnings.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                ⚠️ Cảnh báo auto-fill:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {autoFillWarnings.map((warning, index) => (
                  <li key={index} className="text-sm text-amber-700 dark:text-amber-300">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Chapter, Skill, and Difficulty Selection Form */}
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
                    setSelectedChapterCode('');
                    setSelectedSkillCode('');
                    setFormErrors({});
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    formErrors.grade
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={gradesLoading}
                >
                  {gradesLoading ? (
                    <option value="">Đang tải...</option>
                  ) : gradesData && gradesData.length > 0 ? (
                    gradesData.map((grade) => (
                      <option key={grade} value={grade}>
                        Lớp {grade}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value={6}>Lớp 6</option>
                      <option value={7}>Lớp 7</option>
                    </>
                  )}
                </select>
                {formErrors.grade && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.grade}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chương <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedChapterCode}
                  onChange={(e) => {
                    setSelectedChapterCode(e.target.value);
                    setSelectedSkillCode('');
                    setFormErrors({});
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    formErrors.chapterCode
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={!selectedGrade || chaptersLoading}
                >
                  <option value="">{!selectedGrade ? 'Chọn lớp trước' : chaptersLoading ? 'Đang tải...' : 'Chọn chương'}</option>
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.code}>
                      {chapter.code} - {chapter.name}
                    </option>
                  ))}
                </select>
                {formErrors.chapterCode && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.chapterCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kỹ năng <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSkillCode}
                  onChange={(e) => {
                    setSelectedSkillCode(e.target.value);
                    setFormErrors({});
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    formErrors.skillCode
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={!selectedChapterCode}
                >
                  <option value="">{!selectedChapterCode ? 'Chọn chương trước' : 'Chọn kỹ năng'}</option>
                  {sortedSkills.map((skill: Skill) => (
                    <option key={skill.id} value={skill.code}>
                      {skill.code} - {skill.name}
                    </option>
                  ))}
                </select>
                {formErrors.skillCode && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.skillCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Độ khó <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDifficultyLevel}
                  onChange={(e) => {
                    setSelectedDifficultyLevel(parseInt(e.target.value));
                    setFormErrors({});
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    formErrors.difficultyLevel
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value={1}>1 - Rất dễ</option>
                  <option value={2}>2 - Dễ</option>
                  <option value={3}>3 - Trung bình</option>
                  <option value={4}>4 - Khó</option>
                  <option value={5}>5 - Rất khó</option>
                </select>
                {formErrors.difficultyLevel && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.difficultyLevel}</p>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Vui lòng chọn đầy đủ thông tin để tạo bài tập từ JSON
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleValidate}
              disabled={validating}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {validating ? 'Đang kiểm tra...' : 'Kiểm tra'}
            </button>
            <button
              type="button"
              onClick={handleCreateExercise}
              disabled={!isValidated || validationErrors.length > 0 || !selectedChapterCode || !selectedSkillCode || submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Đang tạo...' : 'Tạo bài tập'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


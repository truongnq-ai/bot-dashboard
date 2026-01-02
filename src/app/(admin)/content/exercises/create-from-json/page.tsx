/**
 * Create Exercise from JSON Page
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ImportExerciseJsonRequest } from '@/types/exercise';
import { importExerciseFromJson, checkExerciseJson, fixExerciseJson } from '@/lib/api/exercise.service';
import { showError, showSuccess } from '@/lib/utils/toast';
import { useSkills } from '@/lib/hooks/useSkills';
import { useGrades } from '@/lib/hooks/useGrades';
import { getChaptersByGrade } from '@/lib/api/chapter.service';
import { getSkillsByChapter } from '@/lib/api/skill.service';
import { Skill } from '@/types/skill';
import { Chapter } from '@/types/chapter';
import { CheckJsonResponse, FixJsonResponse } from '@/types/exercise';

export default function CreateFromJsonPage() {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState('');
  const [checkResult, setCheckResult] = useState<CheckJsonResponse | null>(null);
  const [fixResult, setFixResult] = useState<FixJsonResponse | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [fixing, setFixing] = useState(false);
  
  // Chapter, Skill, and Difficulty selection state
  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedChapterCode, setSelectedChapterCode] = useState<string>('');
  const [selectedSkillCode, setSelectedSkillCode] = useState<string>('');
  const [selectedDifficultyLevel, setSelectedDifficultyLevel] = useState<number>(3);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [chapterSkills, setChapterSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
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

  // Fetch skills by chapter when chapterCode is selected
  useEffect(() => {
    const fetchChapterSkills = async () => {
      if (selectedChapterCode && chapters.length > 0) {
        // Find chapter by code
        const chapter = chapters.find(c => c.code === selectedChapterCode);
        if (chapter?.id) {
          setSkillsLoading(true);
          try {
            const response = await getSkillsByChapter(chapter.id);
            if (response.errorCode === '0000' && response.data) {
              // Sort skills by code
              const sorted = [...response.data].sort((a, b) => {
                return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
              });
              setChapterSkills(sorted);
            } else {
              setChapterSkills([]);
            }
          } catch (error) {
            console.error('Failed to fetch chapter skills:', error);
            setChapterSkills([]);
          } finally {
            setSkillsLoading(false);
          }
        } else {
          setChapterSkills([]);
        }
      } else {
        setChapterSkills([]);
      }
    };
    fetchChapterSkills();
  }, [selectedChapterCode, chapters]);

  // Sort skills by code alphabetically - use chapterSkills if available, otherwise fallback to all skills
  const sortedSkills = useMemo(() => {
    if (chapterSkills.length > 0) {
      return chapterSkills;
    }
    // Fallback to all skills if no chapter selected
    if (!skillsData?.content) return [];
    return [...skillsData.content].sort((a, b) => {
      return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [chapterSkills, skillsData]);

  // Reset chapterCode and skillCode when grade changes
  useEffect(() => {
    setSelectedChapterCode('');
    setSelectedSkillCode('');
    setChapterSkills([]); // Clear chapter skills when grade changes
  }, [selectedGrade]);

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
      // JSON invalid, can't auto-fill
      setAutoFillWarnings([]);
      return;
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

  const handleCheck = async () => {
    if (!jsonInput.trim()) {
      showError('Vui lòng nhập JSON');
      return;
    }

    setCheckResult(null);
    setFixResult(null);
    setIsValidated(false);
    setChecking(true);

    try {
      // Inject metadata for check
      let jsonToCheck = jsonInput;
      try {
        const parsed = JSON.parse(jsonInput);
        const jsonWithMetadata = {
          ...parsed,
          chapterCode: selectedChapterCode || parsed.chapterCode || '',
          skillCode: selectedSkillCode || parsed.skillCode || '',
          difficultyLevel: selectedDifficultyLevel || parsed.difficultyLevel || 3,
        };
        jsonToCheck = JSON.stringify(jsonWithMetadata);
      } catch (e) {
        // JSON invalid, send raw string - backend will handle
      }

      const response = await checkExerciseJson({ rawExerciseJson: jsonToCheck });
      
      if (response.errorCode === '0000' && response.data) {
        setCheckResult(response.data);
        setIsValidated(response.data.isValid);
        
        if (response.data.isValid) {
          showSuccess('JSON hợp lệ! Bạn có thể tạo bài tập.');
        } else {
          showError(`Phát hiện ${response.data.allErrorCodes.length} lỗi. Vui lòng click "Sửa" để tự động sửa.`);
        }
      } else {
        showError(response.errorDetail || 'Kiểm tra thất bại');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      showError('Kiểm tra thất bại: ' + errorMessage);
    } finally {
      setChecking(false);
    }
  };

  const handleFix = async () => {
    if (!checkResult || !checkResult.allErrorCodes || checkResult.allErrorCodes.length === 0) {
      showError('Không có lỗi để sửa. Vui lòng kiểm tra JSON trước.');
      return;
    }

    setFixing(true);
    setFixResult(null);

    try {
      // Inject metadata for fix
      let jsonToFix = jsonInput;
      try {
        const parsed = JSON.parse(jsonInput);
        const jsonWithMetadata = {
          ...parsed,
          chapterCode: selectedChapterCode || parsed.chapterCode || '',
          skillCode: selectedSkillCode || parsed.skillCode || '',
          difficultyLevel: selectedDifficultyLevel || parsed.difficultyLevel || 3,
        };
        jsonToFix = JSON.stringify(jsonWithMetadata);
      } catch (e) {
        // JSON invalid, send raw string - backend will handle
      }

      const response = await fixExerciseJson({
        rawExerciseJson: jsonToFix,
        errorCodes: checkResult.allErrorCodes,
      });

      if (response.errorCode === '0000' && response.data) {
        setFixResult(response.data);
        
        // Update jsonInput with fixed JSON
        if (response.data.fixedJson) {
          setJsonInput(response.data.fixedJson);
        }

        if (response.data.unfixableErrors.length > 0) {
          showError(`Đã sửa ${response.data.fixesApplied.length} lỗi. Còn ${response.data.unfixableErrors.length} lỗi không thể tự động sửa.`);
        } else {
          showSuccess(`Đã sửa ${response.data.fixesApplied.length} lỗi thành công. Vui lòng kiểm tra lại.`);
          // Auto-check after fix
          setTimeout(() => {
            handleCheck();
          }, 500);
        }
      } else {
        showError(response.errorDetail || 'Sửa thất bại');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      showError('Sửa thất bại: ' + errorMessage);
    } finally {
      setFixing(false);
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
    // Validate Chapter, Skill, and Difficulty
    if (!validateForm()) {
      showError('Vui lòng chọn đầy đủ thông tin Chương, Kỹ năng và Độ khó');
      return;
    }

    setSubmitting(true);

    try {
      // Parse JSON and inject metadata at root level
      // Backend will handle fixing if JSON is invalid
      let jsonToSubmit = jsonInput;
      try {
        const parsedJson = JSON.parse(jsonInput);
        const jsonWithMetadata = {
          ...parsedJson,
          chapterCode: selectedChapterCode,
          skillCode: selectedSkillCode,
          difficultyLevel: selectedDifficultyLevel,
        };
        jsonToSubmit = JSON.stringify(jsonWithMetadata);
      } catch (e) {
        // JSON invalid - backend will try to fix
        // Still inject metadata if possible at string level, or send raw
        // For now, send raw and let backend handle
      }

      // Call import API - backend will fix JSON if invalid and normalize LaTeX
      const request: ImportExerciseJsonRequest = {
        rawExerciseJson: jsonToSubmit,
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
                setCheckResult(null);
                setFixResult(null);
              }}
              spellCheck={false}
              className={`w-full h-96 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm ${
                checkResult && !checkResult.isValid
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCheck}
              disabled={!jsonInput.trim() || checking}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {checking ? 'Đang kiểm tra...' : 'Kiểm tra'}
            </button>
            <button
              onClick={handleFix}
              disabled={!checkResult || checkResult.isValid || checkResult.allErrorCodes.length === 0 || fixing}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {fixing ? 'Đang sửa...' : 'Sửa'}
            </button>
          </div>

          {/* Check Results - Nested Errors */}
          {checkResult && (
            <div className="space-y-4">
              {/* JSON Errors */}
              {!checkResult.json.isValid && checkResult.json.errors.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                    Lỗi JSON ({checkResult.json.errors.length}):
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {checkResult.json.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700 dark:text-red-300">
                        <span className="font-mono text-xs">{error.location}</span>: {error.message}
                        {error.suggestion && (
                          <span className="block text-xs text-red-600 dark:text-red-400 mt-1">
                            Gợi ý: {error.suggestion}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* LaTeX Basic Errors */}
              {!checkResult.latexBasic.isValid && checkResult.latexBasic.errors.length > 0 && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                    Lỗi LaTeX Cơ bản ({checkResult.latexBasic.errors.length}):
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {checkResult.latexBasic.errors.map((error, index) => (
                      <li key={index} className="text-sm text-orange-700 dark:text-orange-300">
                        <span className="font-mono text-xs">{error.location}</span>: {error.message}
                        {error.suggestion && (
                          <span className="block text-xs text-orange-600 dark:text-orange-400 mt-1">
                            Gợi ý: {error.suggestion}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* LaTeX Advanced Errors */}
              {!checkResult.latexAdvanced.isValid && checkResult.latexAdvanced.errors.length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Lỗi LaTeX Chuyên sâu ({checkResult.latexAdvanced.errors.length}):
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {checkResult.latexAdvanced.errors.map((error, index) => (
                      <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                        <span className="font-mono text-xs">{error.location}</span>: {error.message}
                        {error.suggestion && (
                          <span className="block text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            Gợi ý: {error.suggestion}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Message */}
              {checkResult.isValid && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✓ JSON hợp lệ! Vui lòng chọn Kỹ năng và Lớp bên dưới.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Fix Results */}
          {fixResult && (
            <div className="space-y-4">
              {/* Fixes Applied */}
              {fixResult.fixesApplied.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    Đã sửa ({fixResult.fixesApplied.length}):
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {fixResult.fixesApplied.map((fix, index) => (
                      <li key={index} className="text-sm text-green-700 dark:text-green-300">
                        <span className="font-mono text-xs">{fix.location}</span> ({fix.fixType}): {fix.errorCode}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unfixable Errors */}
              {fixResult.unfixableErrors.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                    Không thể sửa tự động ({fixResult.unfixableErrors.length}):
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {fixResult.unfixableErrors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700 dark:text-red-300">
                        <span className="font-mono text-xs">{error.location}</span>: {error.message}
                        {error.suggestion && (
                          <span className="block text-xs text-red-600 dark:text-red-400 mt-1">
                            Gợi ý: {error.suggestion}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
                  disabled={!selectedChapterCode || skillsLoading}
                >
                  <option value="">
                    {!selectedChapterCode 
                      ? 'Chọn chương trước' 
                      : skillsLoading 
                        ? 'Đang tải...' 
                        : 'Chọn kỹ năng'}
                  </option>
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
              onClick={handleCreateExercise}
              disabled={!selectedChapterCode || !selectedSkillCode || submitting}
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


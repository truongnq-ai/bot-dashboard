/**
 * Exercise Edit Form
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useExercise } from '@/lib/hooks/useExercises';
import { updateExercise } from '@/lib/api/exercise.service';
import { UpdateExerciseRequest, SolutionStepRequest, CommonMistakeRequest } from '@/types/exercise';
import { useSkills } from '@/lib/hooks/useSkills';
import SolutionStepsEditor from './SolutionStepsEditor';
import { uploadImage } from '@/lib/api/image.service';
import { useDropzone } from 'react-dropzone';
import { ReviewStatus } from '@/types/exercise';
import { showError, showSuccess } from '@/lib/utils/toast';
import { Skill } from '@/types/skill';
import { getChaptersByGrade } from '@/lib/api/chapter.service';
import { getSkillsByChapter } from '@/lib/api/skill.service';
import { Chapter } from '@/types/chapter';
import { BUTTON_LOADING_CONFIG } from '@/lib/config/ui.config';
import LaTeXPreview from '@/components/common/LaTeXPreview';
import { checkExerciseLaTeX, fixExerciseLaTeX } from '@/lib/api/exercise.service';
import { CheckLaTeXRequest, CheckLaTeXResponse, FixLaTeXRequest, ValidationError, FixApplied } from '@/types/exercise';

const exerciseSchema = z.object({
  skillId: z.string().optional().or(z.literal('')),
  grade: z.number().min(6).max(7).optional(),
  chapterId: z.string().optional().or(z.literal('')),
  problemType: z.string().optional().or(z.literal('')),
  problemText: z.string().optional().or(z.literal('')),
  problemLatex: z.string().optional().or(z.literal('')),
  problemImageUrl: z.string().optional().or(z.literal('')),
  difficultyLevel: z.number().min(1).max(5).optional(),
  finalAnswer: z.string().optional().or(z.literal('')),
  learningObjective: z.string().optional().or(z.literal('')),
  timeEstimateSec: z.number().positive().optional(),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

interface ExerciseEditFormProps {
  id: string;
}

export default function ExerciseEditForm({ id }: ExerciseEditFormProps) {
  const router = useRouter();
  const { data: exercise, loading: exerciseLoading } = useExercise(id);
  const [solutionSteps, setSolutionSteps] = useState<SolutionStepRequest[]>([]);
  const [commonMistakes, setCommonMistakes] = useState<CommonMistakeRequest[]>([]);
  const [hints, setHints] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDots, setLoadingDots] = useState('.');
  const [checkResult, setCheckResult] = useState<CheckLaTeXResponse | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [checking, setChecking] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [chapterSkills, setChapterSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
  });

  const selectedGrade = watch('grade');
  const selectedChapterId = watch('chapterId');
  const { data: skillsData } = useSkills({
    grade: (selectedGrade || exercise?.grade) as 6 | 7 | undefined,
    chapterId: selectedChapterId || exercise?.chapterId,
    pageSize: 1000,
    sortBy: 'code',
    sortDirection: 'asc',
  });

  // Fetch chapters by grade when grade is selected or when exercise is loaded
  useEffect(() => {
    const fetchChapters = async () => {
      const gradeToFetch = selectedGrade || exercise?.grade;
      if (gradeToFetch) {
        setChaptersLoading(true);
        try {
          const response = await getChaptersByGrade(gradeToFetch as 6 | 7);
          if (response.errorCode === '0000' && response.data) {
            setChapters(response.data);
          }
        } catch (error) {
          console.error('Failed to fetch chapters:', error);
        } finally {
          setChaptersLoading(false);
        }
      } else {
        setChapters([]);
      }
    };
    fetchChapters();
  }, [selectedGrade, exercise?.grade]);

  // Fetch skills by chapter when chapter is selected or when exercise is loaded
  useEffect(() => {
    const fetchChapterSkills = async () => {
      const chapterIdToFetch = selectedChapterId || exercise?.chapterId;
      if (chapterIdToFetch) {
        setSkillsLoading(true);
        try {
          const response = await getSkillsByChapter(chapterIdToFetch);
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
    };
    fetchChapterSkills();
  }, [selectedChapterId, exercise?.chapterId]);

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

  // Load exercise data
  useEffect(() => {
    if (exercise) {
      reset({
        skillId: exercise.skillId,
        grade: exercise.grade,
        chapterId: exercise.chapterId || '',
        problemType: exercise.problemType || '',
        problemText: exercise.problemText || '',
        problemLatex: exercise.problemLatex || '', // Convert null to empty string
        problemImageUrl: exercise.problemImageUrl || '',
        difficultyLevel: exercise.difficultyLevel,
        finalAnswer: exercise.finalAnswer || '',
        learningObjective: exercise.learningObjective || '',
        timeEstimateSec: exercise.timeEstimateSec,
      });
      setImageUrl(exercise.problemImageUrl || '');
      
      // Load solution steps - should be populated by getExerciseById now
      if (exercise.solutionSteps && exercise.solutionSteps.length > 0) {
        setSolutionSteps(
          exercise.solutionSteps.map((s) => ({
            stepNumber: s.stepNumber,
            description: s.description || '',
            content: s.content,
            explanation: s.explanation || '',
          }))
        );
      } else {
        // If no solution steps, initialize with empty array
        setSolutionSteps([]);
      }
      
      setCommonMistakes(exercise.commonMistakes || []);
      setHints(exercise.hints || []);
    }
  }, [exercise, reset]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    try {
      // Pass exercise ID as questionId in metadata when editing
      const response = await uploadImage(file, 'practice', { questionId: id });
      if (response.data) {
        setImageUrl(response.data.imageUrl);
        setValue('problemImageUrl', response.data.imageUrl);
      }
    } catch (error) {
      showError('Tải hình ảnh thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    multiple: false,
  });

  const onSubmit = async (data: ExerciseFormData) => {
    if (solutionSteps.length === 0 || solutionSteps.some((s) => !s.content.trim())) {
      showError('Vui lòng thêm ít nhất một bước giải có nội dung');
      return;
    }

    setSubmitting(true);

    try {
      const request: UpdateExerciseRequest = {
        ...data,
        problemText: data.problemText || undefined,
        problemLatex: data.problemLatex || undefined, // Convert empty string to undefined
        problemImageUrl: imageUrl || undefined,
        finalAnswer: data.finalAnswer || undefined,
        solutionSteps,
        learningObjective: data.learningObjective || undefined,
        commonMistakes: commonMistakes.length > 0 ? commonMistakes : undefined,
        hints: hints.length > 0 ? hints : undefined,
      };

      await updateExercise(id, request);
      showSuccess('Cập nhật bài tập thành công');
      router.push(`/content/exercises/${id}`);
    } catch (error) {
      showError('Cập nhật bài tập thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    } finally {
      setSubmitting(false);
    }
  };

  // Error handler for form validation errors
  const onError = (validationErrors: any) => {
    // Log validation errors for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Form validation errors:', validationErrors);
    }
    
    // Check if errors object has any keys
    const errorKeys = Object.keys(validationErrors || {});
    if (errorKeys.length === 0) {
      // If errors object is empty, it might be a validation issue that wasn't captured
      // Check formState.errors as fallback
      const formStateErrorKeys = Object.keys(errors || {});
      if (formStateErrorKeys.length > 0) {
        // Use formState errors if available
        const errorMessages = formStateErrorKeys.map((field) => {
          const error = (errors as any)[field];
          return error?.message || `${field}: Lỗi validation`;
        });
        showError(`Lỗi validation: ${errorMessages.join(', ')}`);
      } else {
        // Show generic message if no errors found
        showError('Vui lòng kiểm tra lại các trường trong form');
      }
      return;
    }
    
    const errorMessages = errorKeys.map((field) => {
      const error = validationErrors[field];
      if (error?.message) {
        return `${field}: ${error.message}`;
      }
      // Handle nested errors (e.g., array fields)
      if (error && typeof error === 'object') {
        const nestedErrors = Object.entries(error).map(([key, value]: [string, any]) => {
          return value?.message || `${key}: Lỗi validation`;
        });
        return nestedErrors.length > 0 ? nestedErrors.join(', ') : `${field}: Lỗi validation`;
      }
      return `${field}: Lỗi validation`;
    });
    
    if (errorMessages.length > 0) {
      showError(`Lỗi validation: ${errorMessages.join(', ')}`);
    } else {
      // Fallback if no error messages were extracted
      showError('Có lỗi xảy ra khi xác thực form. Vui lòng kiểm tra lại các trường.');
    }
  };

  const addMistake = () => {
    setCommonMistakes([...commonMistakes, { mistake: '', explanation: '' }]);
  };

  const removeMistake = (index: number) => {
    setCommonMistakes(commonMistakes.filter((_, i) => i !== index));
  };

  const updateMistake = (index: number, mistake: CommonMistakeRequest) => {
    const newMistakes = [...commonMistakes];
    newMistakes[index] = mistake;
    setCommonMistakes(newMistakes);
  };

  const addHint = () => {
    setHints([...hints, '']);
  };

  const removeHint = (index: number) => {
    setHints(hints.filter((_, i) => i !== index));
  };

  const updateHint = (index: number, value: string) => {
    const newHints = [...hints];
    newHints[index] = value;
    setHints(newHints);
  };

  // LaTeX Check and Fix handlers (using backend API)
  const handleCheck = async () => {
    setCheckResult(null);
    setShowValidationErrors(true);
    setChecking(true);

    try {
      // Get current form values
      const formValues = watch();
      
      // Prepare exercise data for check
      const checkRequest: CheckLaTeXRequest = {
        problemText: formValues.problemText,
        problemLatex: formValues.problemLatex,
        solutionSteps,
        finalAnswer: formValues.finalAnswer,
        commonMistakes,
        hints,
      };

      const response = await checkExerciseLaTeX(id, checkRequest);
      
      if (response.errorCode === '0000' && response.data) {
        setCheckResult(response.data);
        
        if (response.data.isValid) {
          showSuccess('LaTeX hợp lệ! Không có lỗi nào được phát hiện.');
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
      showError('Không có lỗi để sửa. Vui lòng kiểm tra LaTeX trước.');
      return;
    }

    setFixing(true);

    try {
      // Get current form values
      const formValues = watch();
      
      // Prepare exercise data for fix
      const fixRequest: FixLaTeXRequest = {
        problemText: formValues.problemText,
        problemLatex: formValues.problemLatex,
        solutionSteps,
        finalAnswer: formValues.finalAnswer,
        commonMistakes,
        hints,
        errorCodes: checkResult.allErrorCodes,
      };

      const response = await fixExerciseLaTeX(id, fixRequest);

      if (response.errorCode === '0000' && response.data) {
        // Apply fixes to form fields
        if (response.data.problemText !== undefined) {
          setValue('problemText', response.data.problemText);
        }
        if (response.data.problemLatex !== undefined) {
          setValue('problemLatex', response.data.problemLatex);
        }
        if (response.data.finalAnswer !== undefined) {
          setValue('finalAnswer', response.data.finalAnswer);
        }
        if (response.data.solutionSteps) {
          setSolutionSteps(response.data.solutionSteps);
        }
        if (response.data.commonMistakes) {
          setCommonMistakes(response.data.commonMistakes);
        }
        if (response.data.hints) {
          setHints(response.data.hints);
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

  // Get errors for a specific field
  const getFieldErrors = (fieldName: string, location?: string): ValidationError[] => {
    if (!checkResult || !showValidationErrors) return [];
    
    // Combine errors from latexBasic and latexAdvanced
    const allErrors: ValidationError[] = [
      ...(checkResult.latexBasic.errors || []),
      ...(checkResult.latexAdvanced.errors || [])
    ];
    
    return allErrors.filter((e) => {
      if (location) {
        return e.location === location || e.location.startsWith(location);
      }
      // Map fieldName to location pattern
      const locationPattern = fieldName === 'problemText' ? 'problemText' :
                              fieldName === 'problemLatex' ? 'problemLatex' :
                              fieldName === 'finalAnswer' ? 'finalAnswer' :
                              fieldName.startsWith('solutionSteps') ? 'solutionSteps' :
                              fieldName.startsWith('commonMistakes') ? 'commonMistakes' :
                              fieldName.startsWith('hints') ? 'hints' : '';
      return e.location.startsWith(locationPattern);
    });
  };

  if (exerciseLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (!exercise) {
    return <div className="text-center py-8">Không tìm thấy bài tập</div>;
  }

  const isApproved = exercise.reviewStatus === ReviewStatus.APPROVED;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sửa bài tập</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Hủy
        </button>
      </div>

      {isApproved && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            Cảnh báo: Bài tập này đã được duyệt. Chỉnh sửa sẽ đặt lại trạng thái thành CHỜ DUYỆT.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        {/* Similar form structure as CreateForm but with pre-filled values */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Thông tin cơ bản</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lớp</label>
              <select
                {...register('grade', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Chọn lớp</option>
                <option value={6}>Lớp 6</option>
                <option value={7}>Lớp 7</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chương</label>
              <select
                {...register('chapterId')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={!selectedGrade || chaptersLoading}
              >
                <option value="">{!selectedGrade ? 'Chọn lớp trước' : chaptersLoading ? 'Đang tải...' : 'Chọn chương'}</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.code} - {chapter.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kỹ năng</label>
              <select
                {...register('skillId')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={!selectedGrade || !selectedChapterId || skillsLoading}
              >
                <option value="">
                  {!selectedGrade 
                    ? 'Chọn lớp trước' 
                    : !selectedChapterId 
                      ? 'Chọn chương trước' 
                      : skillsLoading
                        ? 'Đang tải...'
                        : 'Chọn kỹ năng'}
                </option>
                {sortedSkills.map((skill: Skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.code} - {skill.name}
                  </option>
                ))}
              </select>
              {errors.skillId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.skillId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nội dung bài toán
              </label>
              <textarea
                {...register('problemText')}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  getFieldErrors('problemText', 'problemText').length > 0
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.problemText && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.problemText.message}</p>
              )}
              {showValidationErrors && (
                <LaTeXPreview
                  text={watch('problemText') || ''}
                  errors={getFieldErrors('problemText', 'problemText')}
                  showErrors={showValidationErrors}
                  className="mt-2"
                />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <SolutionStepsEditor steps={solutionSteps} onChange={setSolutionSteps} />
        </div>

        {/* Check Results Summary */}
        {showValidationErrors && checkResult && !checkResult.isValid && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                  Phát hiện {checkResult.allErrorCodes.length} lỗi LaTeX
                </h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {(() => {
                    const allErrors = [...checkResult.latexBasic.errors, ...checkResult.latexAdvanced.errors];
                    return allErrors.slice(0, 5).map((error, index) => (
                      <div key={index} className="text-sm text-red-700 dark:text-red-300">
                        <span className="font-medium">{error.location}:</span> {error.message}
                        {error.suggestion && (
                          <span className="text-gray-600 dark:text-gray-400 ml-1">({error.suggestion})</span>
                        )}
                      </div>
                    ));
                  })()}
                  {checkResult.allErrorCodes.length > 5 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      và {checkResult.allErrorCodes.length - 5} lỗi khác...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="px-6 py-2 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative"
          >
            {checking && (
              <svg
                className="animate-spin h-4 w-4"
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
            Kiểm tra
            {checkResult && !checkResult.isValid && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {checkResult.allErrorCodes.length}
              </span>
            )}
          </button>
          {checkResult && !checkResult.isValid && checkResult.allErrorCodes.length > 0 && (
            <button
              type="button"
              onClick={handleFix}
              disabled={fixing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative"
            >
              {fixing && (
                <svg
                  className="animate-spin h-4 w-4"
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
              Sửa
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && (
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
            {submitting ? `Đang cập nhật${loadingDots}` : 'Cập nhật bài tập'}
          </button>
        </div>
      </form>
    </div>
  );
}

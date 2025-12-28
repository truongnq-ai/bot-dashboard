/**
 * Exercise Edit Form
 */

'use client';

import React, { useState, useEffect } from 'react';
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
import { Chapter } from '@/types/chapter';
import { BUTTON_LOADING_CONFIG } from '@/lib/config/ui.config';
import { validateExerciseLaTeX, autoFixLaTeX, ValidationResult, LaTeXError, ExerciseFormDataForValidation } from '@/lib/utils/latex-validator';
import LaTeXPreview from '@/components/common/LaTeXPreview';
import { validateLaTeX } from '@/lib/api/exercise.service';
import { ValidateLaTeXRequest } from '@/types/exercise';

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
  const { data: skillsData } = useSkills();
  const [solutionSteps, setSolutionSteps] = useState<SolutionStepRequest[]>([]);
  const [commonMistakes, setCommonMistakes] = useState<CommonMistakeRequest[]>([]);
  const [hints, setHints] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDots, setLoadingDots] = useState('.');
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [validating, setValidating] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  const selectedGrade = watch('grade');

  // Fetch chapters by grade when grade is selected
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
      } else {
        setChapters([]);
      }
    };
    fetchChapters();
  }, [selectedGrade]);

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

  // Load exercise data
  useEffect(() => {
    if (exercise) {
      reset({
        skillId: exercise.skillId,
        grade: exercise.grade,
        chapterId: exercise.chapterId,
        problemType: exercise.problemType,
        problemText: exercise.problemText,
        problemLatex: exercise.problemLatex,
        problemImageUrl: exercise.problemImageUrl,
        difficultyLevel: exercise.difficultyLevel,
        finalAnswer: exercise.finalAnswer,
        learningObjective: exercise.learningObjective,
        timeEstimateSec: exercise.timeEstimateSec,
      });
      setImageUrl(exercise.problemImageUrl || '');
      setSolutionSteps(
        exercise.solutionSteps.map((s) => ({
          stepNumber: s.stepNumber,
          description: s.description,
          content: s.content,
          explanation: s.explanation,
        }))
      );
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
        problemImageUrl: imageUrl || undefined,
        solutionSteps,
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

  // LaTeX Validation handlers
  const handleValidate = async () => {
    setValidating(true);
    setShowValidationErrors(true);

    try {
      // Get current form values
      const formValues = watch();
      
      // Prepare exercise data for validation
      const exerciseData: ExerciseFormDataForValidation = {
        problemText: formValues.problemText,
        problemLatex: formValues.problemLatex,
        solutionSteps,
        finalAnswer: formValues.finalAnswer,
        commonMistakes,
        hints,
      };

      // Run frontend validation
      const result = validateExerciseLaTeX(exerciseData);
      setValidationResults(result);

      if (result.isValid) {
        showSuccess('Không có lỗi LaTeX nào được phát hiện');
      } else {
        showError(`Phát hiện ${result.errors.length} lỗi LaTeX (${result.autoFixableCount} có thể sửa tự động)`);
        
        // If there are complex errors (non-auto-fixable), call backend API for comprehensive validation
        const complexErrors = result.errors.filter((e) => !e.autoFixable);
        if (complexErrors.length > 0) {
          try {
            const validationRequest: ValidateLaTeXRequest = {
              problemText: formValues.problemText,
              problemLatex: formValues.problemLatex,
              solutionSteps,
              finalAnswer: formValues.finalAnswer,
              commonMistakes,
              hints,
            };
            
            const backendResult = await validateLaTeX(id, validationRequest);
            if (backendResult.data) {
              // Merge backend results with frontend results
              const mergedErrors = [...result.errors];
              backendResult.data.errors.forEach((backendError) => {
                // Only add if not already present (avoid duplicates)
                if (!mergedErrors.some((e) => e.location === backendError.location && e.error === backendError.error)) {
                  mergedErrors.push(backendError);
                }
              });
              
              setValidationResults({
                isValid: backendResult.data.isValid,
                errors: mergedErrors,
                autoFixableCount: backendResult.data.autoFixableCount,
              });
            }
          } catch (error) {
            // If backend validation fails, use frontend results
            // Log only in development mode
            if (process.env.NODE_ENV === 'development') {
              console.warn('Backend validation failed, using frontend results:', error);
            }
          }
        }
      }
    } catch (error) {
      showError('Lỗi khi kiểm tra LaTeX: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    } finally {
      setValidating(false);
    }
  };

  const handleAutoFix = () => {
    if (!validationResults || validationResults.autoFixableCount === 0) {
      return;
    }

    const autoFixableErrors = validationResults.errors.filter((e) => e.autoFixable && e.fixedValue);

    // Apply fixes to form fields
    autoFixableErrors.forEach((error) => {
      if (error.fixedValue) {
        // Determine which field to update based on location
        if (error.location.startsWith('problemText')) {
          const fixed = autoFixLaTeX(watch('problemText') || '');
          setValue('problemText', fixed.fixed);
        } else if (error.location.startsWith('problemLatex')) {
          setValue('problemLatex', error.fixedValue);
        } else if (error.location.startsWith('finalAnswer')) {
          const fixed = autoFixLaTeX(watch('finalAnswer') || '');
          setValue('finalAnswer', fixed.fixed);
        } else if (error.location.startsWith('solutionSteps[')) {
          const match = error.location.match(/solutionSteps\[(\d+)\]\.(content|explanation)/);
          if (match) {
            const index = parseInt(match[1]);
            const field = match[2] as 'content' | 'explanation';
            const newSteps = [...solutionSteps];
            if (newSteps[index]) {
              const fixed = autoFixLaTeX(newSteps[index][field] || '');
              newSteps[index] = { ...newSteps[index], [field]: fixed.fixed };
              setSolutionSteps(newSteps);
            }
          }
        } else if (error.location.startsWith('commonMistakes[')) {
          const match = error.location.match(/commonMistakes\[(\d+)\]\.(mistake|explanation)/);
          if (match) {
            const index = parseInt(match[1]);
            const field = match[2] as 'mistake' | 'explanation';
            const newMistakes = [...commonMistakes];
            if (newMistakes[index]) {
              const fixed = autoFixLaTeX(newMistakes[index][field] || '');
              newMistakes[index] = { ...newMistakes[index], [field]: fixed.fixed };
              setCommonMistakes(newMistakes);
            }
          }
        } else if (error.location.startsWith('hints[')) {
          const match = error.location.match(/hints\[(\d+)\]/);
          if (match) {
            const index = parseInt(match[1]);
            const newHints = [...hints];
            if (newHints[index]) {
              const fixed = autoFixLaTeX(newHints[index]);
              newHints[index] = fixed.fixed;
              setHints(newHints);
            }
          }
        }
      }
    });

    showSuccess(`Đã áp dụng ${autoFixableErrors.length} sửa tự động`);
    
    // Re-validate after auto-fix
    setTimeout(() => {
      handleValidate();
    }, 100);
  };

  // Get errors for a specific field
  const getFieldErrors = (fieldName: string, location?: string): LaTeXError[] => {
    if (!validationResults || !showValidationErrors) return [];
    return validationResults.errors.filter((e) => {
      if (location) {
        return e.location === location || e.location.startsWith(location);
      }
      return e.field === fieldName;
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
              >
                <option value="">Chọn kỹ năng</option>
                {skillsData?.content?.map((skill: Skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
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

        {/* Validation Results Summary */}
        {showValidationErrors && validationResults && !validationResults.isValid && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                  Phát hiện {validationResults.errors.length} lỗi LaTeX
                </h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {validationResults.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="text-sm text-red-700 dark:text-red-300">
                      <span className="font-medium">{error.location}:</span> {error.error}
                      {error.suggestion && (
                        <span className="text-gray-600 dark:text-gray-400 ml-1">({error.suggestion})</span>
                      )}
                    </div>
                  ))}
                  {validationResults.errors.length > 5 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      và {validationResults.errors.length - 5} lỗi khác...
                    </p>
                  )}
                </div>
              </div>
            </div>
            {validationResults.autoFixableCount > 0 && (
              <button
                type="button"
                onClick={handleAutoFix}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                Áp dụng {validationResults.autoFixableCount} sửa tự động
              </button>
            )}
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
            onClick={handleValidate}
            disabled={validating}
            className="px-6 py-2 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative"
          >
            {validating && (
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
            {validationResults && !validationResults.isValid && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {validationResults.errors.length}
              </span>
            )}
          </button>
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

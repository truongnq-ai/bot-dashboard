/**
 * Exercise Create Form
 */

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createExercise, createExerciseSolution } from '@/lib/api/exercise.service';
import { CreateExerciseRequest, CreateExerciseSolutionRequest, SolutionStepRequest, CommonMistakeRequest, ExerciseStatus, ExerciseCreatedBy } from '@/types/exercise';
import { useSkills } from '@/lib/hooks/useSkills';
import { useGrades } from '@/lib/hooks/useGrades';
import { Skill } from '@/types/skill';
import { getChaptersByGrade } from '@/lib/api/chapter.service';
import { Chapter } from '@/types/chapter';
import SolutionStepsEditor from './SolutionStepsEditor';
import { uploadImage } from '@/lib/api/image.service';
import { useDropzone } from 'react-dropzone';
import { showError, showSuccess } from '@/lib/utils/toast';
import { BUTTON_LOADING_CONFIG } from '@/lib/config/ui.config';
import { getExerciseDataFromJson } from '@/lib/utils/navigation';

const exerciseSchema = z.object({
  skillId: z.string().min(1, 'Kỹ năng là bắt buộc'),
  grade: z.number().min(6).max(7),
  chapterId: z.string().min(1, 'Chương là bắt buộc'),
  problemText: z.string().min(1, 'Nội dung bài toán là bắt buộc'),
  problemLatex: z.string().optional(),
  problemImageUrl: z.string().optional(),
  difficultyLevel: z.number().min(1).max(5),
  finalAnswer: z.string().optional(),
  learningObjective: z.string().optional(),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

export default function ExerciseCreateForm() {
  const router = useRouter();
  const { data: gradesData } = useGrades();
  const [solutionSteps, setSolutionSteps] = useState<SolutionStepRequest[]>([
    { stepNumber: 1, content: '', description: '', explanation: '' },
  ]);
  const [commonMistakes, setCommonMistakes] = useState<CommonMistakeRequest[]>([]);
  const [hints, setHints] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDots, setLoadingDots] = useState('.');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  // Animation for loading dots
  useEffect(() => {
    if (submitting) {
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
  }, [submitting]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      grade: 6,
    },
  });

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

  // Flag to track if we're loading from JSON (to prevent skillId reset)
  const isLoadingFromJsonRef = useRef(false);

  // Reset skillId when grade changes (but skip if loading from JSON)
  const prevGradeRef = useRef<number | undefined>(selectedGrade);
  useEffect(() => {
    // Skip reset if we're currently loading from JSON
    if (isLoadingFromJsonRef.current) {
      prevGradeRef.current = selectedGrade;
      return;
    }

    if (prevGradeRef.current !== undefined && prevGradeRef.current !== selectedGrade) {
      setValue('skillId', '');
      setValue('chapterId', '');
    }
    prevGradeRef.current = selectedGrade;
  }, [selectedGrade, setValue]);

  // Load data from JSON if available
  useEffect(() => {
    const jsonData = getExerciseDataFromJson();
    if (jsonData) {
      // Set flag to prevent skillId reset during loading
      isLoadingFromJsonRef.current = true;
      
      let timer: NodeJS.Timeout | null = null;
      let clearFlagTimer: NodeJS.Timeout | null = null;

      // Populate form fields
      // Set grade first, then skillId after a brief delay to avoid reset issue
      if (jsonData.grade) {
        setValue('grade', jsonData.grade, { shouldValidate: false });
      }
      
      if (jsonData.skillId) {
        // Set skillId after a delay to ensure grade is processed first
        // This prevents the reset logic from clearing skillId
        timer = setTimeout(() => {
          setValue('skillId', jsonData.skillId!, { shouldValidate: false });
          // Clear flag after setting skillId (with additional delay to ensure it's set)
          clearFlagTimer = setTimeout(() => {
            isLoadingFromJsonRef.current = false;
          }, 50);
        }, 200); // Increased delay to ensure grade change is fully processed
      } else {
        // If no skillId, clear flag immediately
        isLoadingFromJsonRef.current = false;
      }

      // Continue with other fields
      if (jsonData.problemText) {
        setValue('problemText', jsonData.problemText);
      }
      if (jsonData.problemLatex) {
        setValue('problemLatex', jsonData.problemLatex);
      }
      if (jsonData.difficultyLevel) {
        setValue('difficultyLevel', jsonData.difficultyLevel);
      }
      if (jsonData.finalAnswer) {
        setValue('finalAnswer', jsonData.finalAnswer);
      }
      if (jsonData.learningObjective) {
        setValue('learningObjective', jsonData.learningObjective);
      }
      if (jsonData.timeEstimateSec) {
        setValue('timeEstimateSec', jsonData.timeEstimateSec);
      }
      // Note: chapterId from JSON will be set if available, but we don't parse chapter text
      if (jsonData.problemType) {
        setValue('problemType', jsonData.problemType);
      }

      // Populate solution steps
      if (jsonData.solutionSteps && jsonData.solutionSteps.length > 0) {
        setSolutionSteps(jsonData.solutionSteps);
      }

      // Populate common mistakes
      if (jsonData.commonMistakes && jsonData.commonMistakes.length > 0) {
        setCommonMistakes(jsonData.commonMistakes);
      }

      // Populate hints
      if (jsonData.hints && jsonData.hints.length > 0) {
        setHints(jsonData.hints);
      }

      showSuccess('Đã tải dữ liệu từ JSON');

      // Cleanup timers on unmount
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
        if (clearFlagTimer) {
          clearTimeout(clearFlagTimer);
        }
        // Reset flag on unmount if still loading
        if (isLoadingFromJsonRef.current) {
          isLoadingFromJsonRef.current = false;
        }
      };
    }
  }, [setValue]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    try {
      const response = await uploadImage(file, 'practice');
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
      // Create exercise with mapped fields
      const exerciseRequest: CreateExerciseRequest = {
        chapterId: data.chapterId!,
        skillId: data.skillId,
        contentText: data.problemText, // Map problemText → contentText
        contentLatex: data.problemLatex || undefined, // Map problemLatex → contentLatex
        difficulty: data.difficultyLevel!, // Map difficultyLevel → difficulty
        createdBy: ExerciseCreatedBy.ADMIN,
        status: ExerciseStatus.DRAFT,
        learningObjective: data.learningObjective || undefined,
        commonMistakes: commonMistakes.length > 0 ? commonMistakes : undefined,
        hints: hints.length > 0 ? hints : undefined,
      };

      const exerciseResponse = await createExercise(exerciseRequest);
      
      if (!exerciseResponse.data?.id) {
        throw new Error('Failed to get exercise ID from response');
      }

      // Create solution separately with serialized solutionSteps
      const solutionRequest: CreateExerciseSolutionRequest = {
        solutionSteps: JSON.stringify(solutionSteps), // Serialize array to JSON string
        finalAnswer: data.finalAnswer || undefined,
        explanation: undefined, // Not used in Phase 1
        createdBy: ExerciseCreatedBy.ADMIN,
      };

      await createExerciseSolution(exerciseResponse.data.id, solutionRequest);
      
      showSuccess('Tạo bài tập thành công');
      router.push('/content/exercises');
    } catch (error) {
      showError('Tạo bài tập thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    } finally {
      setSubmitting(false);
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tạo bài tập</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Hủy
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Thông tin cơ bản</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lớp *
                  </label>
                  <select
                    {...register('grade', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {gradesData?.map((grade) => (
                      <option key={grade} value={grade}>
                        Lớp {grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chương *
                  </label>
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
                  {errors.chapterId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.chapterId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kỹ năng *
                  </label>
                  <select
                    {...register('skillId')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Chọn kỹ năng</option>
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

                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Độ khó *
                    </label>
                    <select
                      {...register('difficultyLevel', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Chọn độ khó</option>
                      <option value={1}>1 - Rất dễ</option>
                      <option value={2}>2 - Dễ</option>
                      <option value={3}>3 - Trung bình</option>
                      <option value={4}>4 - Khó</option>
                      <option value={5}>5 - Rất khó</option>
                    </select>
                    {errors.difficultyLevel && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.difficultyLevel.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nội dung bài toán *
                  </label>
                  <textarea
                    {...register('problemText')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Nhập nội dung bài toán..."
                  />
                  {errors.problemText && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.problemText.message}</p>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hình ảnh bài toán
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {uploading ? (
                      <p className="text-gray-600 dark:text-gray-400">Đang tải lên...</p>
                    ) : imageUrl ? (
                      <div>
                        <img src={imageUrl} alt="Bài toán" className="max-h-48 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Nhấp để đổi hình ảnh</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Kéo thả hình ảnh vào đây, hoặc nhấp để chọn
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          PNG, JPG, GIF tối đa 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Solution Steps */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <SolutionStepsEditor steps={solutionSteps} onChange={setSolutionSteps} />
            </div>

            {/* Common Mistakes */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lỗi thường gặp</h2>
                <button
                  type="button"
                  onClick={addMistake}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thêm lỗi
                </button>
              </div>
              {commonMistakes.map((mistake, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Lỗi {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeMistake(index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400"
                    >
                      Xóa
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Mô tả lỗi"
                    value={mistake.mistake}
                    onChange={(e) => updateMistake(index, { ...mistake, mistake: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                  />
                  <textarea
                    placeholder="Giải thích (tùy chọn)"
                    value={mistake.explanation || ''}
                    onChange={(e) => updateMistake(index, { ...mistake, explanation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                  />
                </div>
              ))}
            </div>

            {/* Hints */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gợi ý</h2>
                <button
                  type="button"
                  onClick={addHint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thêm gợi ý
                </button>
              </div>
              {hints.map((hint, index) => (
                <div key={index} className="mb-2 flex gap-2">
                  <input
                    type="text"
                    placeholder={`Gợi ý ${index + 1}`}
                    value={hint}
                    onChange={(e) => updateHint(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeHint(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Preview & Metadata */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Thông tin bổ sung</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chương
                  </label>
                  <input
                    type="text"
                    {...register('chapter')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Loại bài toán
                  </label>
                  <input
                    type="text"
                    {...register('problemType')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Đáp án cuối cùng
                  </label>
                  <input
                    type="text"
                    {...register('finalAnswer')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mục tiêu học tập
                  </label>
                  <textarea
                    {...register('learningObjective')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Hủy
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
            {submitting ? `Đang tạo${loadingDots}` : 'Tạo bài tập'}
          </button>
        </div>
      </form>
    </div>
  );
}

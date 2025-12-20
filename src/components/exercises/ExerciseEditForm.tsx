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

const exerciseSchema = z.object({
  skillId: z.string().optional(),
  grade: z.number().min(6).max(7).optional(),
  chapter: z.string().optional(),
  problemType: z.string().optional(),
  problemText: z.string().optional(),
  problemLatex: z.string().optional(),
  problemImageUrl: z.string().optional(),
  difficultyLevel: z.number().min(1).max(5).optional(),
  finalAnswer: z.string().optional(),
  learningObjective: z.string().optional(),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
  });

  // Load exercise data
  useEffect(() => {
    if (exercise) {
      reset({
        skillId: exercise.skillId,
        grade: exercise.grade,
        chapter: exercise.chapter,
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
      const response = await uploadImage(file, 'practice');
      if (response.data) {
        setImageUrl(response.data.imageUrl);
        setValue('problemImageUrl', response.data.imageUrl);
      }
    } catch (error) {
      showError('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
      showError('Please add at least one solution step with content');
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
      showSuccess('Exercise updated successfully');
      router.push(`/content/exercises/${id}`);
    } catch (error) {
      showError('Failed to update exercise: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

  if (exerciseLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!exercise) {
    return <div className="text-center py-8">Exercise not found</div>;
  }

  const isApproved = exercise.reviewStatus === ReviewStatus.APPROVED;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Exercise</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>

      {isApproved && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            Warning: This exercise is approved. Editing will reset its status to PENDING.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Similar form structure as CreateForm but with pre-filled values */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skill</label>
              <select
                {...register('skillId')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a skill</option>
                {skillsData?.content?.map((skill: Skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Problem Text</label>
              <textarea
                {...register('problemText')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <SolutionStepsEditor steps={solutionSteps} onChange={setSolutionSteps} />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Updating...' : 'Update Exercise'}
          </button>
        </div>
      </form>
    </div>
  );
}

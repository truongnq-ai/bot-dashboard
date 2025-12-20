/**
 * Exercise Create Form
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createExercise } from '@/lib/api/exercise.service';
import { CreateExerciseRequest, SolutionStepRequest, CommonMistakeRequest } from '@/types/exercise';
import { useSkills } from '@/lib/hooks/useSkills';
import SolutionStepsEditor from './SolutionStepsEditor';
import { uploadImage } from '@/lib/api/image.service';
import { useDropzone } from 'react-dropzone';

const exerciseSchema = z.object({
  skillId: z.string().min(1, 'Skill is required'),
  grade: z.number().min(6).max(7),
  chapter: z.string().optional(),
  problemType: z.string().optional(),
  problemText: z.string().min(1, 'Problem text is required'),
  problemLatex: z.string().optional(),
  problemImageUrl: z.string().optional(),
  difficultyLevel: z.number().min(1).max(5).optional(),
  finalAnswer: z.string().optional(),
  learningObjective: z.string().optional(),
  timeEstimateSec: z.number().positive().optional(),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

export default function ExerciseCreateForm() {
  const router = useRouter();
  const { data: skillsData } = useSkills();
  const [solutionSteps, setSolutionSteps] = useState<SolutionStepRequest[]>([
    { stepNumber: 1, content: '', description: '', explanation: '' },
  ]);
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
    watch,
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      grade: 6,
    },
  });

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
      alert('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
      alert('Please add at least one solution step with content');
      return;
    }

    setSubmitting(true);

    try {
      const request: CreateExerciseRequest = {
        ...data,
        problemImageUrl: imageUrl || undefined,
        solutionSteps,
        commonMistakes: commonMistakes.length > 0 ? commonMistakes : undefined,
        hints: hints.length > 0 ? hints : undefined,
      };

      await createExercise(request);
      router.push('/content/exercises');
    } catch (error) {
      alert('Failed to create exercise: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Exercise</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Skill *
                  </label>
                  <select
                    {...register('skillId')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a skill</option>
                    {skillsData?.content?.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
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
                      Grade *
                    </label>
                    <select
                      {...register('grade', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value={6}>Grade 6</option>
                      <option value={7}>Grade 7</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      {...register('difficultyLevel', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select difficulty</option>
                      <option value={1}>1 - Very Easy</option>
                      <option value={2}>2 - Easy</option>
                      <option value={3}>3 - Medium</option>
                      <option value={4}>4 - Hard</option>
                      <option value={5}>5 - Very Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Problem Text *
                  </label>
                  <textarea
                    {...register('problemText')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter the problem text..."
                  />
                  {errors.problemText && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.problemText.message}</p>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Problem Image
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
                      <p className="text-gray-600 dark:text-gray-400">Uploading...</p>
                    ) : imageUrl ? (
                      <div>
                        <img src={imageUrl} alt="Problem" className="max-h-48 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Click to change image</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Drag and drop an image here, or click to select
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Common Mistakes</h2>
                <button
                  type="button"
                  onClick={addMistake}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Mistake
                </button>
              </div>
              {commonMistakes.map((mistake, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Mistake {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeMistake(index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Mistake description"
                    value={mistake.mistake}
                    onChange={(e) => updateMistake(index, { ...mistake, mistake: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                  />
                  <textarea
                    placeholder="Explanation (optional)"
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hints</h2>
                <button
                  type="button"
                  onClick={addHint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Hint
                </button>
              </div>
              {hints.map((hint, index) => (
                <div key={index} className="mb-2 flex gap-2">
                  <input
                    type="text"
                    placeholder={`Hint ${index + 1}`}
                    value={hint}
                    onChange={(e) => updateHint(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeHint(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Preview & Metadata */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Additional Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chapter
                  </label>
                  <input
                    type="text"
                    {...register('chapter')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Problem Type
                  </label>
                  <input
                    type="text"
                    {...register('problemType')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Final Answer
                  </label>
                  <input
                    type="text"
                    {...register('finalAnswer')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Learning Objective
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
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create Exercise'}
          </button>
        </div>
      </form>
    </div>
  );
}

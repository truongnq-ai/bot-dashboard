'use client';

import React, { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useExercise } from '@/lib/hooks/useExercises';
import ExerciseForm from '@/components/exercises/ExerciseForm';
import { updateExercise } from '@/lib/api/exercise.service';
import { UpdateExerciseRequest } from '@/types/exercise';
import { toast } from 'react-hot-toast';

export default function EditExerciseContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const { data: exercise, loading } = useExercise(id);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: UpdateExerciseRequest) => {
        try {
            setIsLoading(true);
            await updateExercise(id, data);
            toast.success('Cập nhật bài tập thành công');
            const from = searchParams.get('from');
            if (from) {
                router.push(decodeURIComponent(from));
            } else {
                router.push(`/exercises`); // Fallback to list page if no from param
            }
        } catch (error) {
            toast.error('Cập nhật bài tập thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        const from = searchParams.get('from');
        if (from) {
            router.push(decodeURIComponent(from));
        } else {
            router.push(`/exercises`);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
            </div>
        );
    }

    if (!exercise) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-400">Không tìm thấy bài tập</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Chỉnh sửa bài tập</h1>
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                    Quay lại
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <ExerciseForm
                    exercise={exercise}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}

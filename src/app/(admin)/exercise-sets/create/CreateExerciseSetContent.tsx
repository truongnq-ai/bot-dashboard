'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ExerciseSetForm from '@/components/exercise-sets/ExerciseSetForm';
import { CreateExerciseSetRequest, UpdateExerciseSetRequest } from '@/types/exercise-set';
import { createExerciseSet } from '@/lib/api/exercise-set.service';
import { toast } from 'react-hot-toast';

export default function CreateExerciseSetContent() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: CreateExerciseSetRequest | UpdateExerciseSetRequest) => {
        try {
            setIsLoading(true);
            const response = await createExerciseSet(data as CreateExerciseSetRequest);
            toast.success('Tạo đề bài thành công');
            // Redirect to edit page to add exercises
            if (response.data?.id) {
                router.push(`/exercise-sets/${response.data.id}/edit`);
            } else {
                router.push('/exercise-sets');
            }
        } catch (error) {
            toast.error('Tạo đề bài thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/exercise-sets');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Tạo đề bài mới</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <ExerciseSetForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import ExerciseSetForm from '@/components/exercise-sets/ExerciseSetForm';
import { useExerciseSet } from '@/lib/hooks/useExerciseSets';
import { UpdateExerciseSetRequest } from '@/types/exercise-set';
import { updateExerciseSet } from '@/lib/api/exercise-set.service';
import { toast } from 'react-hot-toast';

export default function EditExerciseSetContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const { data: exerciseSet, loading, refetch } = useExerciseSet(id);
    const [isLoading, setIsLoading] = useState(false);

    // Refetch when component mounts
    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleSubmit = async (data: UpdateExerciseSetRequest) => {
        try {
            setIsLoading(true);
            await updateExerciseSet(id, data);
            toast.success('Cập nhật đề bài thành công');
            const from = searchParams.get('from');
            if (from) {
                router.push(decodeURIComponent(from));
            } else {
                router.push(`/exercise-sets`);
            }
        } catch (error) {
            toast.error('Cập nhật đề bài thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        const from = searchParams.get('from');
        if (from) {
            router.push(decodeURIComponent(from));
        } else {
            router.push(`/exercise-sets`);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
            </div>
        );
    }

    if (!exerciseSet) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-400">Không tìm thấy đề bài</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Chỉnh sửa đề bài</h1>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <ExerciseSetForm
                    exerciseSet={exerciseSet}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}

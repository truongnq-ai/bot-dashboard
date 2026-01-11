'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExerciseForm from '@/components/exercises/ExerciseForm';
import { createExercise } from '@/lib/api/exercise.service';
import { CreateExerciseRequest, UpdateExerciseRequest, Exercise } from '@/types/exercise';
import { toast } from 'react-hot-toast';
import { getExerciseDataForCopy } from '@/lib/utils/navigation';

export default function CreateExerciseContent() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [copyData, setCopyData] = useState<Exercise | null>(null);

    useEffect(() => {
        const data = getExerciseDataForCopy();
        if (data) {
            setCopyData(data as Exercise);
        }
    }, []);

    const handleSubmit = async (data: CreateExerciseRequest | UpdateExerciseRequest) => {
        try {
            setIsLoading(true);
            // Type guard: ensure required fields for CreateExerciseRequest
            if (!('subjectId' in data && data.subjectId) || !('topicId' in data && data.topicId) || !('content' in data && data.content)) {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                return;
            }
            const createData: CreateExerciseRequest = {
                subjectId: data.subjectId!,
                topicId: data.topicId!,
                content: data.content!,
                contentLatex: data.contentLatex,
                difficulty: data.difficulty,
                type: data.type,
                solutionDraft: data.solutionDraft,
                learningObjective: data.learningObjective,
                commonMistakes: data.commonMistakes,
                hints: data.hints,
                timeEstimateSec: data.timeEstimateSec,
            };
            await createExercise(createData);
            toast.success('Tạo bài tập thành công');
            router.push('/exercises');
        } catch (error) {
            toast.error('Tạo bài tập thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/exercises');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Tạo bài tập mới</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <ExerciseForm exercise={copyData} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
            </div>
        </div>
    );
}

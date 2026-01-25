/**
 * Exercise Statistics Table Component
 */

'use client';

import React from 'react';
import { ExerciseStats } from '@/types/exercise';
import { getExerciseTypeName } from '@/lib/utils/formatters';
import DifficultyBadge from '../exercises/DifficultyBadge';
import { useReferenceData } from '@/context/ReferenceDataContext';

interface ExerciseStatsTableProps {
    stats: ExerciseStats[];
}

export default function ExerciseStatsTable({ stats }: ExerciseStatsTableProps) {
    const { getTopicPath } = useReferenceData();

    if (!stats || stats.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 text-center rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">Không có dữ liệu thống kê phù hợp với bộ lọc.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                                Môn học
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                                Chủ đề
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 text-center">
                                Độ khó
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                                Loại bài tập
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 text-right">
                                Số bài tập
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {stats.map((item, index) => (
                            <tr key={`${item.subjectId}-${item.topicId}-${item.difficulty}-${item.type}-${index}`} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                                    {item.subjectName}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                                    {getTopicPath(item.topicId) || item.topicName}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200 text-center">
                                    <DifficultyBadge difficulty={item.difficulty} />
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                                    {getExerciseTypeName(item.type)}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-brand-600 dark:text-brand-400 text-right">
                                    {item.exerciseCount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

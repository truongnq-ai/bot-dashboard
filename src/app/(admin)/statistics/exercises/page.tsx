import { Metadata } from 'next';
import ExerciseStats from '@/components/statistics/ExerciseStats';

export const metadata: Metadata = {
    title: 'Thống kê bài tập | Tutor Admin Dashboard',
    description: 'Thống kê số lượng bài tập theo môn học, chủ đề, độ khó và loại bài tập',
};

export default function ExerciseStatsPage() {
    return <ExerciseStats />;
}

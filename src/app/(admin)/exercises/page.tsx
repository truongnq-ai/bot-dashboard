import { Metadata } from 'next';
import ExerciseList from '@/components/exercises/ExerciseList';

export const metadata: Metadata = {
    title: 'Quản lý bài tập | Tutor Admin Dashboard',
    description: 'Quản lý danh sách bài tập',
};

export default function ExercisesPage() {
    return <ExerciseList />;
}

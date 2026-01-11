import { Metadata } from 'next';
import ExerciseSetList from '@/components/exercise-sets/ExerciseSetList';

export const metadata: Metadata = {
    title: 'Quản lý đề bài | Tutor Admin Dashboard',
    description: 'Quản lý danh sách đề bài',
};

export default function ExerciseSetsPage() {
    return <ExerciseSetList />;
}

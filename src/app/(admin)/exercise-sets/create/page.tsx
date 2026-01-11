import { Metadata } from 'next';
import CreateExerciseSetContent from './CreateExerciseSetContent';

export const metadata: Metadata = {
    title: 'Tạo đề bài mới | Tutor Admin Dashboard',
    description: 'Tạo đề bài mới',
};

export default function CreateExerciseSetPage() {
    return <CreateExerciseSetContent />;
}

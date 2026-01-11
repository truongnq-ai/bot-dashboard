import { Metadata } from 'next';
import CreateExerciseContent from './CreateExerciseContent';

export const metadata: Metadata = {
    title: 'Tạo bài tập mới | Tutor Admin Dashboard',
    description: 'Tạo bài tập mới',
};

export default function CreateExercisePage() {
    return <CreateExerciseContent />;
}

import { Metadata } from 'next';
import EditExerciseContent from './EditExerciseContent';

export const metadata: Metadata = {
    title: 'Chỉnh sửa bài tập | Tutor Admin Dashboard',
    description: 'Chỉnh sửa bài tập',
};

export default function EditExercisePage() {
    return <EditExerciseContent />;
}

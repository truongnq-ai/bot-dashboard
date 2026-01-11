import { Metadata } from 'next';
import EditExerciseSetContent from './EditExerciseSetContent';

export const metadata: Metadata = {
    title: 'Chỉnh sửa đề bài | Tutor Admin Dashboard',
    description: 'Chỉnh sửa đề bài',
};

export default function EditExerciseSetPage() {
    return <EditExerciseSetContent />;
}

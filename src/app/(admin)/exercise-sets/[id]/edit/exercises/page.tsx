import { Metadata } from 'next';
import SelectExercisesContent from './SelectExercisesContent';

export const metadata: Metadata = {
    title: 'Chọn bài tập | Tutor Admin Dashboard',
    description: 'Chọn bài tập cho đề bài',
};

export default function SelectExercisesPage() {
    return <SelectExercisesContent />;
}

/**
 * Exercise Edit Page
 */

import { Metadata } from 'next';
import ExerciseEditForm from '@/components/exercises/ExerciseEditForm';

export const metadata: Metadata = {
  title: 'Sửa bài tập | Tutor Admin Dashboard',
  description: 'Chỉnh sửa bài tập',
};

export default function EditExercisePage({ params }: { params: { id: string } }) {
  return <ExerciseEditForm id={params.id} />;
}

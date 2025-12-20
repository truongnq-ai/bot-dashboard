/**
 * Exercise Edit Page
 */

import { Metadata } from 'next';
import ExerciseEditForm from '@/components/exercises/ExerciseEditForm';

export const metadata: Metadata = {
  title: 'Edit Exercise | Tutor Admin Dashboard',
  description: 'Edit exercise',
};

export default function EditExercisePage({ params }: { params: { id: string } }) {
  return <ExerciseEditForm id={params.id} />;
}

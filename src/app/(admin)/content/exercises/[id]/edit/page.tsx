/**
 * Exercise Edit Page
 */

import { Metadata } from 'next';
import ExerciseEditForm from '@/components/exercises/ExerciseEditForm';

export const metadata: Metadata = {
  title: 'Sửa bài tập | Tutor Admin Dashboard',
  description: 'Chỉnh sửa bài tập',
};

export default async function EditExercisePage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const resolvedParams = await Promise.resolve(params);
  return <ExerciseEditForm id={resolvedParams.id} />;
}

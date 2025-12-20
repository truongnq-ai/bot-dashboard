/**
 * Exercise Create Page
 */

import { Metadata } from 'next';
import ExerciseCreateForm from '@/components/exercises/ExerciseCreateForm';

export const metadata: Metadata = {
  title: 'Tạo bài tập | Tutor Admin Dashboard',
  description: 'Tạo bài tập mới',
};

export default function CreateExercisePage() {
  return <ExerciseCreateForm />;
}

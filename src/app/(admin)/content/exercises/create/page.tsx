/**
 * Exercise Create Page
 */

import { Metadata } from 'next';
import ExerciseCreateForm from '@/components/exercises/ExerciseCreateForm';

export const metadata: Metadata = {
  title: 'Create Exercise | Tutor Admin Dashboard',
  description: 'Create a new exercise',
};

export default function CreateExercisePage() {
  return <ExerciseCreateForm />;
}

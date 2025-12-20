/**
 * Exercise List Page
 */

import { Metadata } from 'next';
import ExerciseList from '@/components/exercises/ExerciseList';

export const metadata: Metadata = {
  title: 'Exercises | Tutor Admin Dashboard',
  description: 'Manage exercises',
};

export default function ExercisesPage() {
  return <ExerciseList />;
}

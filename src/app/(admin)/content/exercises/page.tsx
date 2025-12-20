/**
 * Exercise List Page
 */

import { Metadata } from 'next';
import ExerciseList from '@/components/exercises/ExerciseList';

export const metadata: Metadata = {
  title: 'Bài tập | Tutor Admin Dashboard',
  description: 'Quản lý bài tập',
};

export default function ExercisesPage() {
  return <ExerciseList />;
}

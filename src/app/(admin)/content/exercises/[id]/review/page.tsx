/**
 * Exercise Review Page
 */

import { Metadata } from 'next';
import ExerciseReviewPanel from '@/components/exercises/ExerciseReviewPanel';

export const metadata: Metadata = {
  title: 'Duyệt bài tập | Tutor Admin Dashboard',
  description: 'Duyệt bài tập',
};

export default function ReviewExercisePage({ params }: { params: { id: string } }) {
  return <ExerciseReviewPanel id={params.id} />;
}

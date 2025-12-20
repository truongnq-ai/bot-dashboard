/**
 * Exercise Review Page
 */

import { Metadata } from 'next';
import ExerciseReviewPanel from '@/components/exercises/ExerciseReviewPanel';

export const metadata: Metadata = {
  title: 'Review Exercise | Tutor Admin Dashboard',
  description: 'Review exercise',
};

export default function ReviewExercisePage({ params }: { params: { id: string } }) {
  return <ExerciseReviewPanel id={params.id} />;
}

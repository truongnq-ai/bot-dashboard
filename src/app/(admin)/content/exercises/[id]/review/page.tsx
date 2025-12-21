/**
 * Exercise Review Page
 */

import { Metadata } from 'next';
import ExerciseReviewPanel from '@/components/exercises/ExerciseReviewPanel';

export const metadata: Metadata = {
  title: 'Duyệt bài tập | Tutor Admin Dashboard',
  description: 'Duyệt bài tập',
};

export default async function ReviewExercisePage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const resolvedParams = await Promise.resolve(params);
  return <ExerciseReviewPanel id={resolvedParams.id} />;
}

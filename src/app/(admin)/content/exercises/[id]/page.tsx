/**
 * Exercise Detail Page
 */

import { Metadata } from 'next';
import ExerciseDetailView from '@/components/exercises/ExerciseDetailView';

export const metadata: Metadata = {
  title: 'Chi tiết bài tập | Tutor Admin Dashboard',
  description: 'Xem chi tiết bài tập',
};

export default async function ExerciseDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const resolvedParams = await Promise.resolve(params);
  return <ExerciseDetailView id={resolvedParams.id} />;
}

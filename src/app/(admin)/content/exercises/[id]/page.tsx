/**
 * Exercise Detail Page
 */

import { Metadata } from 'next';
import ExerciseDetailView from '@/components/exercises/ExerciseDetailView';

export const metadata: Metadata = {
  title: 'Chi tiết bài tập | Tutor Admin Dashboard',
  description: 'Xem chi tiết bài tập',
};

export default function ExerciseDetailPage({ params }: { params: { id: string } }) {
  return <ExerciseDetailView id={params.id} />;
}

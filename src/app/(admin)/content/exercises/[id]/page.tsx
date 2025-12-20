/**
 * Exercise Detail Page
 */

import { Metadata } from 'next';
import ExerciseDetailView from '@/components/exercises/ExerciseDetailView';

export const metadata: Metadata = {
  title: 'Exercise Detail | Tutor Admin Dashboard',
  description: 'View exercise details',
};

export default function ExerciseDetailPage({ params }: { params: { id: string } }) {
  return <ExerciseDetailView id={params.id} />;
}

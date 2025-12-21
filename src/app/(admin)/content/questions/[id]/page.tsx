/**
 * Question Detail Page
 */

import { Metadata } from 'next';
import QuestionDetail from '@/components/questions/QuestionDetail';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Câu hỏi ${params.id} | Tutor Admin Dashboard`,
    description: 'Chi tiết câu hỏi',
  };
}

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  return <QuestionDetail questionId={params.id} />;
}


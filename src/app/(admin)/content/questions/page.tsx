/**
 * Questions List Page
 */

import { Metadata } from 'next';
import QuestionList from '@/components/questions/QuestionList';

export const metadata: Metadata = {
  title: 'Câu hỏi | Tutor Admin Dashboard',
  description: 'Quản lý câu hỏi',
};

export default function QuestionsPage() {
  return <QuestionList />;
}

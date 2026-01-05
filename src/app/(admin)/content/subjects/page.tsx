import { Metadata } from 'next';
import SubjectList from '@/components/subjects/SubjectList';

export const metadata: Metadata = {
  title: 'Quản lý Môn học | Tutor Admin Dashboard',
  description: 'Quản lý danh mục môn học',
};

export default function SubjectsPage() {
  return <SubjectList />;
}


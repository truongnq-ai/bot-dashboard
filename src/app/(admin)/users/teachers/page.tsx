import { Metadata } from 'next';
import TeacherList from '@/components/teachers/TeacherList';

export const metadata: Metadata = {
  title: 'Quản lý Giáo viên | Tutor Admin Dashboard',
  description: 'Quản lý danh sách giáo viên trong hệ thống',
};

export default function TeachersPage() {
  return <TeacherList />;
}


import { Metadata } from 'next';
import ChapterList from '@/components/chapters/ChapterList';

export const metadata: Metadata = {
  title: 'Quản lý Chương | Tutor Admin Dashboard',
  description: 'Quản lý danh mục chương học',
};

export default function ChaptersPage() {
  return <ChapterList />;
}


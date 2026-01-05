import { Metadata } from 'next';
import TopicList from '@/components/topics/TopicList';

export const metadata: Metadata = {
  title: 'Quản lý Topic',
  description: 'Quản lý danh mục topic',
};

export default function TopicsPage() {
  return <TopicList />;
}


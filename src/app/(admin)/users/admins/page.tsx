import { Metadata } from 'next';
import AdminList from '@/components/admins/AdminList';

export const metadata: Metadata = {
  title: 'Quản lý Admin | Tutor Admin Dashboard',
  description: 'Quản lý danh sách admin trong hệ thống',
};

export default function AdminsPage() {
  return <AdminList />;
}

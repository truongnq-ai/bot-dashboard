import { Metadata } from 'next';
import AssignmentList from '@/components/assignments/AssignmentList';

export const metadata: Metadata = {
    title: 'Quản lý Giao bài | Tutor Admin Dashboard',
    description: 'Quản lý danh sách giao bài',
};

export default function AssignmentsPage() {
    return (
        <AssignmentList />
    );
}

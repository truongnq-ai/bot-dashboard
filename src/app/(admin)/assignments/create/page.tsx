import { Metadata } from 'next';
import CreateAssignmentContent from './CreateAssignmentContent';

export const metadata: Metadata = {
    title: 'Giao bài mới | Tutor Admin Dashboard',
    description: 'Giao bài tập cho lớp học',
};

export default function CreateAssignmentPage() {
    return <CreateAssignmentContent />;
}

/**
 * Delete Assignment Confirmation Modal
 */

'use client';

import React, { useState } from 'react';
import ConfirmModal from '@/components/common/ConfirmModal';
import { AssignmentListItem } from '@/types/assignment';
import { deleteAssignment } from '@/lib/api/assignment.service';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/utils/formatters';

interface DeleteAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignment: AssignmentListItem | null;
    onSuccess: () => void;
}

export default function DeleteAssignmentModal({
    isOpen,
    onClose,
    assignment,
    onSuccess,
}: DeleteAssignmentModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        if (!assignment) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteAssignment(assignment.id);
            toast.success('Xóa giao bài thành công');
            onSuccess();
        } catch (error) {
            toast.error(
                'Có lỗi xảy ra khi xóa giao bài: ' +
                (error instanceof Error ? error.message : 'Lỗi không xác định')
            );
        } finally {
            setIsDeleting(false);
        }
    };

    if (!assignment) {
        return null;
    }

    const message = `Bạn có chắc chắn muốn xóa giao bài này không?\n\n` +
        `Đề bài: ${assignment.exerciseSetTitle}\n` +
        `Lớp: ${assignment.className}\n` +
        `Ngày gán: ${formatDate(assignment.assignedAt)}\n\n` +
        `Tất cả kết quả và nhận xét liên quan sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.`;

    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            variant="danger"
            title="Xóa giao bài"
            message={message}
            confirmText="Xóa"
            cancelText="Hủy"
            isLoading={isDeleting}
        />
    );
}

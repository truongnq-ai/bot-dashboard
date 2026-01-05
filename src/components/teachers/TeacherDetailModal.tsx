'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Teacher } from '@/types/teacher';
import { formatDateTime } from '@/lib/utils/formatters';

interface TeacherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
}

export default function TeacherDetailModal({ isOpen, onClose, teacher }: TeacherDetailModalProps) {
  if (!teacher) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chi tiết Giáo viên</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{teacher.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <p className="text-sm text-gray-900 dark:text-white font-medium">{teacher.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tên
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{teacher.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vai trò
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{teacher.role || 'TEACHER'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ngày tạo
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDateTime(teacher.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}


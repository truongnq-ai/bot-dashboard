'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Admin } from '@/types/admin';
import { formatDateTime } from '@/lib/utils/formatters';

interface AdminDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin | null;
}

export default function AdminDetailModal({ isOpen, onClose, admin }: AdminDetailModalProps) {
  if (!admin) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chi tiết Admin</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{admin.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <p className="text-sm text-gray-900 dark:text-white font-medium">{admin.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tên
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{admin.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vai trò
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{admin.role || 'ADMIN'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ngày tạo
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDateTime(admin.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}


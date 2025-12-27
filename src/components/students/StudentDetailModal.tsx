'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Student } from '@/types/student';
import StudentStatusBadge from './StudentStatusBadge';
import { formatDateTime } from '@/lib/utils/formatters';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export default function StudentDetailModal({ isOpen, onClose, student }: StudentDetailModalProps) {
  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chi tiết Học sinh</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{student.id || student.userId}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User ID
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{student.userId}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <p className="text-sm text-gray-900 dark:text-white font-medium">{student.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tên
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{student.name || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{student.email || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Số điện thoại
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{student.phoneNumber || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lớp
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {student.grade ? `Lớp ${student.grade}` : '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái học sinh
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {student.studentStatus || '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái tài khoản
              </label>
              <div className="mt-1">
                <StudentStatusBadge status={student.status} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Xác thực
              </label>
              <div className="text-sm text-gray-900 dark:text-white">
                <p>Điện thoại: {student.phoneVerified ? '✓ Đã xác thực' : '✗ Chưa xác thực'}</p>
                <p>Email: {student.emailVerified ? '✓ Đã xác thực' : '✗ Chưa xác thực'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phụ huynh
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {student.parentName || '-'}
                {student.parentId && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    (ID: {student.parentId.substring(0, 8)}...)
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lần đăng nhập cuối
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {student.lastLoginAt ? formatDateTime(student.lastLoginAt) : 'Chưa đăng nhập'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ngày tạo
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDateTime(student.createdAt)}
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


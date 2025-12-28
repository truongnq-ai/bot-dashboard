'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Chapter } from '@/types/chapter';
import { formatDateTime } from '@/lib/utils/formatters';

interface ChapterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter | null;
}

export default function ChapterDetailModal({ isOpen, onClose, chapter }: ChapterDetailModalProps) {
  if (!chapter) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chi tiết Chương</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID
              </label>
              <p className="text-sm text-gray-900 dark:text-white font-mono">{chapter.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Code
              </label>
              <p className="text-sm text-gray-900 dark:text-white font-mono font-medium">{chapter.code}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tên chương
              </label>
              <p className="text-sm text-gray-900 dark:text-white font-medium">{chapter.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lớp
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Lớp {chapter.grade}
                </span>
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mô tả
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{chapter.description || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ngày tạo
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDateTime(chapter.createdAt)}
              </p>
            </div>

            {chapter.updatedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ngày cập nhật
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDateTime(chapter.updatedAt)}
                </p>
              </div>
            )}
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


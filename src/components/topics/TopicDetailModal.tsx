'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Topic } from '@/types/topic';
import { formatDateTime } from '@/lib/utils/formatters';
import { useSubjects } from '@/lib/hooks/useSubjects';
import { useTopics } from '@/lib/hooks/useTopics';

interface TopicDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
}

export default function TopicDetailModal({ isOpen, onClose, topic }: TopicDetailModalProps) {
  const { data: subjects } = useSubjects();
  const { data: topics } = useTopics({ subjectId: topic?.subjectId });

  const subject = subjects?.find((s) => s.id === topic?.subjectId);
  const parentTopic = topics?.find((t) => t.id === topic?.parentId);
  const childrenCount = topics?.filter((t) => t.parentId === topic?.id).length || 0;

  if (!topic) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chi tiết Topic</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID
              </label>
              <p className="text-sm text-gray-900 dark:text-white font-mono">{topic.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tên topic
              </label>
              <p className="text-sm text-gray-900 dark:text-white font-medium">{topic.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Môn học
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{subject?.name || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Topic cha
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{parentTopic?.name || 'Không có (topic gốc)'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cấp độ
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{topic.level !== undefined ? topic.level : '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Số topic con
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{childrenCount}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thứ tự
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{topic.orderIndex ?? '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ngày tạo
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDateTime(topic.createdAt)}
              </p>
            </div>

            {topic.updatedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ngày cập nhật
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDateTime(topic.updatedAt)}
                </p>
              </div>
            )}
          </div>

          {topic.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mô tả
              </label>
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {topic.description}
              </p>
            </div>
          )}
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


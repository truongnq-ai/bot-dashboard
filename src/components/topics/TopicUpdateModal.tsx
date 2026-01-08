'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { UpdateTopicRequest, Topic } from '@/types/topic';
import { updateTopic } from '@/lib/api/topic.service';
import { showError, showSuccess } from '@/lib/utils/toast';
import { BUTTON_LOADING_CONFIG } from '@/lib/config/ui.config';
import { useTopics } from '@/lib/hooks/useTopics';

interface TopicUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
  onSuccess?: () => void;
}

export default function TopicUpdateModal({ isOpen, onClose, topic, onSuccess }: TopicUpdateModalProps) {
  const [formData, setFormData] = useState<UpdateTopicRequest>({
    name: '',
    description: '',
    parentId: undefined,
    orderIndex: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingDots, setLoadingDots] = useState('.');

  // Get topics for parent dropdown (same subject)
  const { data: topics } = useTopics({ subjectId: topic?.subjectId });

  // Filter out current topic and its descendants from parent options
  const availableParentTopics = useMemo(() => {
    if (!topics || !topic) return [];
    return topics.filter((t) => t.id !== topic.id);
  }, [topics, topic]);

  // Initialize form data when topic changes
  useEffect(() => {
    if (topic) {
      setFormData({
        name: topic.name || '',
        description: topic.description || '',
        parentId: topic.parentId,
        orderIndex: topic.orderIndex,
      });
      setErrors({});
    }
  }, [topic]);

  // Animation for loading dots
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingDots((prev) => {
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          return '.';
        });
      }, BUTTON_LOADING_CONFIG.DOTS_ANIMATION_INTERVAL);

      return () => clearInterval(interval);
    } else {
      setLoadingDots('.');
    }
  }, [loading]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.name && formData.name.length > 255) {
      newErrors.name = 'Tên topic không được vượt quá 255 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic) return;

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const requestData: UpdateTopicRequest = {
        name: formData.name?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        parentId: formData.parentId || undefined,
        orderIndex: formData.orderIndex || undefined,
      };
      const response = await updateTopic(topic.id, requestData);
      if (response.errorCode === '0000') {
        showSuccess('Cập nhật topic thành công');
        onSuccess?.();
        onClose();
      } else {
        showError(response.errorDetail || 'Cập nhật topic thất bại');
      }
    } catch (error) {
      showError('Hệ thống không có phản hồi.');
    } finally {
      setLoading(false);
    }
  };

  if (!topic) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-title-functional text-gray-900 dark:text-white mb-6">Chỉnh sửa topic</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Topic cha (tùy chọn)
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.parentId || ''}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value || undefined })}
            >
              <option value="">Không có (topic gốc)</option>
              {availableParentTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Chọn topic cha để tạo cấu trúc cây. Để trống để làm topic gốc.
            </p>
          </div>

          <div>
            <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên topic
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.name ? 'border-error-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ví dụ: Đại số"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="mt-1 text-theme-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Mô tả topic (tùy chọn)"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thứ tự
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Thứ tự hiển thị (tùy chọn)"
              value={formData.orderIndex || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  orderIndex: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {loading ? `Đang cập nhật${loadingDots}` : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}


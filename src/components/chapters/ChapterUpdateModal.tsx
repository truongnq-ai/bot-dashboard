'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { UpdateChapterRequest, Chapter } from '@/types/chapter';
import { updateChapter } from '@/lib/api/chapter.service';
import { showError, showSuccess } from '@/lib/utils/toast';
import { BUTTON_LOADING_CONFIG } from '@/lib/config/ui.config';

interface ChapterUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter | null;
  onSuccess?: () => void;
}

export default function ChapterUpdateModal({ isOpen, onClose, chapter, onSuccess }: ChapterUpdateModalProps) {
  const [formData, setFormData] = useState<UpdateChapterRequest>({
    code: '',
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingDots, setLoadingDots] = useState('.');

  // Initialize form data when chapter changes
  useEffect(() => {
    if (chapter) {
      setFormData({
        code: chapter.code || '',
        name: chapter.name || '',
        description: chapter.description || '',
      });
      setErrors({});
    }
  }, [chapter]);

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

    if (formData.code && formData.code.length > 50) {
      newErrors.code = 'Mã chương không được vượt quá 50 ký tự';
    }

    if (formData.name && formData.name.length > 255) {
      newErrors.name = 'Tên chương không được vượt quá 255 ký tự';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Mô tả không được vượt quá 1000 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chapter) return;

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const requestData: UpdateChapterRequest = {
        code: formData.code?.trim() || undefined,
        name: formData.name?.trim() || undefined,
        description: formData.description?.trim() || undefined,
      };
      const response = await updateChapter(chapter.id, requestData);
      if (response.errorCode === '0000') {
        showSuccess('Cập nhật chương thành công');
        onSuccess?.();
        onClose();
      } else {
        showError(response.errorDetail || 'Cập nhật chương thất bại');
      }
    } catch (error) {
      showError('Hệ thống không có phản hồi.');
    } finally {
      setLoading(false);
    }
  };

  if (!chapter) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chỉnh sửa chương</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mã chương
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ví dụ: 6.3"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên chương
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ví dụ: Phân số"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Mô tả chi tiết về chương học (tùy chọn)"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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


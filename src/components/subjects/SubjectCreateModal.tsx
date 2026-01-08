'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { CreateSubjectRequest } from '@/types/subject';
import { createSubject } from '@/lib/api/subject.service';
import { showError, showSuccess } from '@/lib/utils/toast';
import { BUTTON_LOADING_CONFIG } from '@/lib/config/ui.config';

interface SubjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SubjectCreateModal({ isOpen, onClose, onSuccess }: SubjectCreateModalProps) {
  const [formData, setFormData] = useState<CreateSubjectRequest>({
    name: '',
    orderIndex: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingDots, setLoadingDots] = useState('.');

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

    if (!formData.name.trim()) {
      newErrors.name = 'Tên môn học là bắt buộc';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Tên môn học không được vượt quá 255 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const requestData: CreateSubjectRequest = {
        name: formData.name.trim(),
        orderIndex: formData.orderIndex || undefined,
      };
      const response = await createSubject(requestData);
      if (response.errorCode === '0000') {
        showSuccess('Tạo môn học thành công');
        onSuccess?.();
        onClose();
        setFormData({
          name: '',
          orderIndex: undefined,
        });
        setErrors({});
      } else {
        showError(response.errorDetail || 'Tạo môn học thất bại');
      }
    } catch (error) {
      showError('Hệ thống không có phản hồi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-title-functional text-gray-900 dark:text-white mb-6">Tạo môn học mới</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên môn học <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.name ? 'border-error-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ví dụ: Toán"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="mt-1 text-theme-sm text-error-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thứ tự
            </label>
            <input
              type="number"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.orderIndex ? 'border-error-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Thứ tự hiển thị (tùy chọn)"
              value={formData.orderIndex || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  orderIndex: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            />
            {errors.orderIndex && <p className="mt-1 text-theme-sm text-error-500">{errors.orderIndex}</p>}
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
              {loading ? `Đang tạo${loadingDots}` : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}


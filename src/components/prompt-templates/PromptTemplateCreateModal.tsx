'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { CreatePromptTemplateRequest } from '@/types/prompt-template';
import { createPromptTemplate } from '@/lib/api/prompt-template.service';
import { showError, showSuccess } from '@/lib/utils/toast';
import { BUTTON_LOADING_CONFIG } from '@/lib/config/ui.config';

interface PromptTemplateCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PromptTemplateCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: PromptTemplateCreateModalProps) {
  const [formData, setFormData] = useState<CreatePromptTemplateRequest>({
    name: '',
    version: 1,
    systemPrompt: '',
    userPromptTemplate: '',
    outputFormatSchema: undefined,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên template là bắt buộc';
    }

    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = 'System prompt là bắt buộc';
    }

    if (!formData.userPromptTemplate.trim()) {
      newErrors.userPromptTemplate = 'User prompt template là bắt buộc';
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
      const response = await createPromptTemplate(formData);
      if (response.errorCode === '0000') {
        showSuccess('Tạo prompt template thành công');
        onSuccess?.();
        onClose();
        // Reset form
        setFormData({
          name: '',
          version: 1,
          systemPrompt: '',
          userPromptTemplate: '',
          outputFormatSchema: undefined,
          isActive: true,
        });
        setErrors({});
      }
    } catch (error) {
      showError('Tạo prompt template thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tạo Prompt Template</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên template *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="exercise_generation_grade_6"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label>
            <input
              type="number"
              min="1"
              value={formData.version || 1}
              onChange={(e) => setFormData({ ...formData, version: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              System Prompt *
            </label>
            <textarea
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              placeholder="Bạn là một giáo viên Toán..."
            />
            {errors.systemPrompt && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.systemPrompt}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User Prompt Template *
            </label>
            <textarea
              value={formData.userPromptTemplate}
              onChange={(e) => setFormData({ ...formData, userPromptTemplate: e.target.value })}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              placeholder="Hãy tạo {COUNT} bài tập..."
            />
            {errors.userPromptTemplate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.userPromptTemplate}</p>
            )}
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive ?? true}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Kích hoạt ngay</span>
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
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
              {loading ? `Đang tạo${loadingDots}` : 'Tạo template'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}


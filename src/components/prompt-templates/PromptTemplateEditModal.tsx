'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { PromptTemplate, UpdatePromptTemplateRequest } from '@/types/prompt-template';
import { updatePromptTemplate } from '@/lib/api/prompt-template.service';
import { showError, showSuccess } from '@/lib/utils/toast';

interface PromptTemplateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: PromptTemplate | null;
  onSuccess?: () => void;
}

export default function PromptTemplateEditModal({
  isOpen,
  onClose,
  template,
  onSuccess,
}: PromptTemplateEditModalProps) {
  const [formData, setFormData] = useState<UpdatePromptTemplateRequest>({
    version: undefined,
    systemPrompt: undefined,
    userPromptTemplate: undefined,
    outputFormatSchema: undefined,
    isActive: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (template) {
      setFormData({
        version: template.version,
        systemPrompt: template.systemPrompt,
        userPromptTemplate: template.userPromptTemplate,
        outputFormatSchema: template.outputFormatSchema,
        isActive: template.isActive,
      });
      setErrors({});
    }
  }, [template]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.systemPrompt !== undefined && !formData.systemPrompt.trim()) {
      newErrors.systemPrompt = 'System prompt không được để trống';
    }

    if (formData.userPromptTemplate !== undefined && !formData.userPromptTemplate.trim()) {
      newErrors.userPromptTemplate = 'User prompt template không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!template) return;

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const response = await updatePromptTemplate(template.id, formData);
      if (response.errorCode === '0000') {
        showSuccess('Cập nhật prompt template thành công');
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      showError('Cập nhật prompt template thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  if (!template) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chỉnh sửa Prompt Template</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label>
            <input
              type="number"
              min="1"
              value={formData.version || template.version}
              onChange={(e) => setFormData({ ...formData, version: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              System Prompt
            </label>
            <textarea
              value={formData.systemPrompt ?? template.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            />
            {errors.systemPrompt && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.systemPrompt}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User Prompt Template
            </label>
            <textarea
              value={formData.userPromptTemplate ?? template.userPromptTemplate}
              onChange={(e) => setFormData({ ...formData, userPromptTemplate: e.target.value })}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            />
            {errors.userPromptTemplate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.userPromptTemplate}</p>
            )}
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive ?? template.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Đang hoạt động</span>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}


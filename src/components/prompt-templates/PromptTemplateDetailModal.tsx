'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { PromptTemplate } from '@/types/prompt-template';
import { formatDateTime } from '@/lib/utils/formatters';
import { showSuccess, showError } from '@/lib/utils/toast';

interface PromptTemplateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: PromptTemplate | null;
}

export default function PromptTemplateDetailModal({
  isOpen,
  onClose,
  template,
}: PromptTemplateDetailModalProps) {
  const [showTooltip, setShowTooltip] = useState<{
    systemPrompt: boolean;
    userPrompt: boolean;
    outputSchema: boolean;
  }>({
    systemPrompt: false,
    userPrompt: false,
    outputSchema: false,
  });

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess(`Đã copy ${fieldName} vào clipboard`);
    } catch (error) {
      showError(`Không thể copy ${fieldName}`);
    }
  };

  if (!template) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chi tiết Prompt Template</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID</label>
              <p className="text-sm text-gray-900 dark:text-white font-mono break-all">{template.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tên template
              </label>
              <p className="text-sm text-gray-900 dark:text-white font-medium font-mono">
                {template.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label>
              <p className="text-sm text-gray-900 dark:text-white">v{template.version}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái
              </label>
              <p className="text-sm">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    template.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {template.isActive ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Người tạo
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{template.createdBy || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ngày tạo
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDateTime(template.createdAt)}
              </p>
            </div>

            {template.updatedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ngày cập nhật
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDateTime(template.updatedAt)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              System Prompt
            </label>
            <div className="mt-1 relative p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleCopy(template.systemPrompt, 'System Prompt')}
                onMouseEnter={() => setShowTooltip({ ...showTooltip, systemPrompt: true })}
                onMouseLeave={() => setShowTooltip({ ...showTooltip, systemPrompt: false })}
                className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Copy System Prompt"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              {showTooltip.systemPrompt && (
                <div className="absolute top-10 right-2 z-10 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg">
                  Copy System Prompt
                </div>
              )}
              <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono pr-8">
                {template.systemPrompt}
              </pre>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User Prompt Template
            </label>
            <div className="mt-1 relative p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleCopy(template.userPromptTemplate, 'User Prompt Template')}
                onMouseEnter={() => setShowTooltip({ ...showTooltip, userPrompt: true })}
                onMouseLeave={() => setShowTooltip({ ...showTooltip, userPrompt: false })}
                className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Copy User Prompt Template"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              {showTooltip.userPrompt && (
                <div className="absolute top-10 right-2 z-10 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg">
                  Copy User Prompt Template
                </div>
              )}
              <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono pr-8">
                {template.userPromptTemplate}
              </pre>
            </div>
          </div>

          {template.outputFormatSchema && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Output Format Schema
              </label>
              <div className="mt-1 relative p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() =>
                    handleCopy(
                      JSON.stringify(template.outputFormatSchema, null, 2),
                      'Output Format Schema'
                    )
                  }
                  onMouseEnter={() => setShowTooltip({ ...showTooltip, outputSchema: true })}
                  onMouseLeave={() => setShowTooltip({ ...showTooltip, outputSchema: false })}
                  className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Copy Output Format Schema"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                {showTooltip.outputSchema && (
                  <div className="absolute top-10 right-2 z-10 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg">
                    Copy Output Format Schema
                  </div>
                )}
                <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono overflow-x-auto pr-8">
                  {JSON.stringify(template.outputFormatSchema, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}


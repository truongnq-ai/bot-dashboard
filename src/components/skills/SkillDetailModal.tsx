'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Skill } from '@/types/skill';
import SkillPrerequisitesBadge from './SkillPrerequisitesBadge';
import { useQuestionsBySkill } from '@/lib/hooks/useQuestions';
import QuestionListCompact from '@/components/questions/QuestionListCompact';
import { formatDateTime } from '@/lib/utils/formatters';

interface SkillDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: Skill | null;
}

export default function SkillDetailModal({ isOpen, onClose, skill }: SkillDetailModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'questions'>('info');
  const { data: questions, loading: questionsLoading } = useQuestionsBySkill(
    skill?.id || null
  );

  if (!skill) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chi tiết Kỹ năng</h2>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Thông tin
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Câu hỏi liên quan {questions && questions.length > 0 && `(${questions.length})`}
            </button>
          </nav>
        </div>

        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID
              </label>
              <p className="text-sm text-gray-900 dark:text-white font-mono">{skill.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Code
              </label>
              <p className="text-sm text-gray-900 dark:text-white font-mono font-medium">{skill.code}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tên kỹ năng
              </label>
              <p className="text-sm text-gray-900 dark:text-white font-medium">{skill.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lớp
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Lớp {skill.grade}
                </span>
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chương
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{skill.chapterName || '-'}</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mô tả
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {skill.description || '-'}
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kỹ năng tiên quyết
              </label>
              <SkillPrerequisitesBadge
                prerequisiteNames={skill.prerequisiteNames}
                prerequisites={skill.prerequisiteIds || []}
                maxDisplay={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ngày tạo
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDateTime(skill.createdAt)}
              </p>
            </div>

            {skill.updatedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ngày cập nhật
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDateTime(skill.updatedAt)}
                </p>
              </div>
            )}
          </div>
        </div>
        )}

        {activeTab === 'questions' && (
          <div>
            {questionsLoading ? (
              <div className="text-center py-8">Đang tải câu hỏi...</div>
            ) : (
              <QuestionListCompact questions={questions || []} maxItems={10} />
            )}
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  onClose();
                  router.push(`/content/questions?skillId=${skill.id}`);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Xem tất cả câu hỏi của kỹ năng này →
              </button>
            </div>
          </div>
        )}

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


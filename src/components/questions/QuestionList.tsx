/**
 * Question List Component
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useQuestions } from '@/lib/hooks/useQuestions';
import { QuestionSearchParams, QuestionStatus } from '@/types/question';
import QuestionListTable from './QuestionListTable';
import GenerateQuestionsModal from './GenerateQuestionsModal';
import { useSkills } from '@/lib/hooks/useSkills';

export default function QuestionList() {
  const [searchParams, setSearchParams] = useState<QuestionSearchParams>({
    page: 0,
    pageSize: 10,
  });
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const { data, loading, error, refetch } = useQuestions(searchParams);
  const { data: skillsData } = useSkills();

  // Sort skills by code (6.1.1 -> 6.1.2 -> 6.2.1 -> 6.2.2 ...)
  const sortedSkills = useMemo(() => {
    if (!skillsData?.content) return [];
    return [...skillsData.content].sort((a, b) => {
      return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [skillsData]);

  const statistics = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        assigned: 0,
        completed: 0,
        skipped: 0,
      };
    }

    const questions = data.content || [];
    return {
      total: data.totalElements || 0,
      assigned: questions.filter((q) => q.status === QuestionStatus.ASSIGNED).length,
      completed: questions.filter((q) => q.status === QuestionStatus.COMPLETED).length,
      skipped: questions.filter((q) => q.status === QuestionStatus.SKIPPED).length,
    };
  }, [data]);

  const handleFilterChange = (newParams: Partial<QuestionSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...newParams, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setSearchParams((prev) => ({ ...prev, pageSize, page: 0 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Câu hỏi</h1>
        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sinh câu hỏi
        </button>
      </div>

      <GenerateQuestionsModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Tổng</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Đã assign</div>
          <div className="text-2xl font-bold text-blue-600">{statistics.assigned}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Đã hoàn thành</div>
          <div className="text-2xl font-bold text-green-600">{statistics.completed}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Đã bỏ qua</div>
          <div className="text-2xl font-bold text-gray-600">{statistics.skipped}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kỹ năng
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchParams.skillId || ''}
              onChange={(e) => handleFilterChange({ skillId: e.target.value || undefined })}
            >
              <option value="">Tất cả</option>
              {sortedSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.code} - {skill.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trạng thái
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchParams.status || ''}
              onChange={(e) => handleFilterChange({ status: (e.target.value as QuestionStatus) || undefined })}
            >
              <option value="">Tất cả</option>
              <option value={QuestionStatus.ASSIGNED}>Đã assign</option>
              <option value={QuestionStatus.COMPLETED}>Đã hoàn thành</option>
              <option value={QuestionStatus.SKIPPED}>Đã bỏ qua</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Tìm theo nội dung..."
              value={searchParams.searchText || ''}
              onChange={(e) => handleFilterChange({ searchText: e.target.value || undefined })}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading && <div className="text-center py-8">Đang tải...</div>}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Lỗi: {error.message}</p>
        </div>
      )}
      {!loading && !error && data && (
        <QuestionListTable
          questions={data.content || []}
          pagination={{
            page: data.page || 0,
            pageSize: data.pageSize || 10,
            totalElements: data.totalElements || 0,
            totalPages: data.totalPages || 0,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      )}
    </div>
  );
}


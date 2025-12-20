'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSkills } from '@/lib/hooks/useSkills';
import { SkillSearchParams, Skill } from '@/types/skill';
import SkillListTable from './SkillListTable';
import SkillFilters from './SkillFilters';
import SkillDetailModal from './SkillDetailModal';
import SkillCreateModal from './SkillCreateModal';

export default function SkillList() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<SkillSearchParams>({
    page: 0,
    pageSize: 10,
  });

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, loading, error, refetch } = useSkills(searchParams);

  const statistics = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        grade6: 0,
        grade7: 0,
      };
    }

    const skills = data.content || [];
    return {
      total: data.totalElements || 0,
      grade6: skills.filter((s) => s.grade === 6).length,
      grade7: skills.filter((s) => s.grade === 7).length,
    };
  }, [data]);

  const handleFilterChange = (newParams: Partial<SkillSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...newParams, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setSearchParams((prev) => ({ ...prev, pageSize, page: 0 }));
  };

  const handleViewDetail = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsDetailModalOpen(true);
  };

  const handleViewRelatedQuestions = (skill: Skill) => {
    // Navigate to questions page with skill filter
    router.push(`/content/questions?skillId=${skill.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Kỹ năng</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Thêm mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Tổng số</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Lớp 6</div>
          <div className="text-2xl font-bold text-blue-600">{statistics.grade6}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Lớp 7</div>
          <div className="text-2xl font-bold text-green-600">{statistics.grade7}</div>
        </div>
      </div>

      {/* Filters */}
      <SkillFilters searchParams={searchParams} onFilterChange={handleFilterChange} />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">{error.message}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && data && (
        <SkillListTable
          skills={data.content}
          onViewDetail={handleViewDetail}
          onViewRelatedQuestions={handleViewRelatedQuestions}
          pagination={{
            page: searchParams.page || 0,
            pageSize: searchParams.pageSize || 10,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      )}

      {/* Detail Modal */}
      <SkillDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSkill(null);
        }}
        skill={selectedSkill}
      />

      {/* Create Modal */}
      <SkillCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}


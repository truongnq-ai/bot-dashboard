'use client';

import React, { useState } from 'react';
import { useSkills } from '@/lib/hooks/useSkills';
import { SkillSearchParams, Skill } from '@/types/skill';
import SkillListTable from './SkillListTable';
import SkillFilters from './SkillFilters';
import SkillDetailModal from './SkillDetailModal';
import SkillCreateModal from './SkillCreateModal';
import SkillUpdateModal from './SkillUpdateModal';
import SkillPrerequisitesModal from './SkillPrerequisitesModal';

export default function SkillList() {
  const [searchParams, setSearchParams] = useState<SkillSearchParams>({
    page: 0,
    pageSize: 10,
  });

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [skillToUpdate, setSkillToUpdate] = useState<Skill | null>(null);
  const [skillForPrerequisites, setSkillForPrerequisites] = useState<Skill | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isPrerequisitesModalOpen, setIsPrerequisitesModalOpen] = useState(false);

  const { data, loading, error, refetch } = useSkills(searchParams);

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


  const handleEdit = (skill: Skill) => {
    setSkillToUpdate(skill);
    setIsUpdateModalOpen(true);
  };

  const handleViewPrerequisites = (skill: Skill) => {
    setSkillForPrerequisites(skill);
    setIsPrerequisitesModalOpen(true);
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
          skills={data.content || []}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onViewPrerequisites={handleViewPrerequisites}
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

      {/* Update Modal */}
      <SkillUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSkillToUpdate(null);
        }}
        onSuccess={refetch}
        skill={skillToUpdate}
      />

      {/* Prerequisites Modal */}
      <SkillPrerequisitesModal
        isOpen={isPrerequisitesModalOpen}
        onClose={() => {
          setIsPrerequisitesModalOpen(false);
          setSkillForPrerequisites(null);
        }}
        skill={skillForPrerequisites}
      />
    </div>
  );
}


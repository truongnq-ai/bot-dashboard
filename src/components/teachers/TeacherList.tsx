'use client';

import React, { useState } from 'react';
import { useTeachers } from '@/lib/hooks/useTeachers';
import { TeacherSearchParams, Teacher } from '@/types/teacher';
import TeacherListTable from './TeacherListTable';
import TeacherFilters from './TeacherFilters';
import TeacherDetailModal from './TeacherDetailModal';
import TeacherCreateModal from './TeacherCreateModal';

export default function TeacherList() {
  const [searchParams, setSearchParams] = useState<TeacherSearchParams>({
    page: 0,
    pageSize: 10,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data, loading, error, refetch } = useTeachers(searchParams);

  const handleFilterChange = (newParams: Partial<TeacherSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...newParams, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setSearchParams((prev) => ({ ...prev, pageSize, page: 0 }));
  };

  const handleViewDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Giáo viên</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          + Tạo mới
        </button>
      </div>

      {/* Filters */}
      <TeacherFilters searchParams={searchParams} onFilterChange={handleFilterChange} />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4">
          <p className="text-error-800 dark:text-error-400">{error.message}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && data && (
        <TeacherListTable
          teachers={data.content}
          onViewDetail={handleViewDetail}
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

      {/* Create Modal */}
      <TeacherCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refetch}
      />

      {/* Detail Modal */}
      <TeacherDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTeacher(null);
        }}
        teacher={selectedTeacher}
      />
    </div>
  );
}


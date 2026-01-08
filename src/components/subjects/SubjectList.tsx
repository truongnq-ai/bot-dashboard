'use client';

import React, { useState, useMemo } from 'react';
import { useSubjects } from '@/lib/hooks/useSubjects';
import { SubjectSearchParams, Subject } from '@/types/subject';
import SubjectListTable from './SubjectListTable';
import SubjectFilters from './SubjectFilters';
import SubjectCreateModal from './SubjectCreateModal';
import SubjectUpdateModal from './SubjectUpdateModal';
import SubjectDetailModal from './SubjectDetailModal';

export default function SubjectList() {
  const [searchParams, setSearchParams] = useState<SubjectSearchParams>({});
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
  });

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [subjectToUpdate, setSubjectToUpdate] = useState<Subject | null>(null);

  const { data, loading, error, refetch, totalElements } = useSubjects(searchParams);

  const handleFilterChange = (newParams: Partial<SubjectSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...newParams }));
    setPagination((prev) => ({ ...prev, page: 0 })); // Reset to first page on filter change
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageSize, page: 0 }));
  };

  const handleViewDetail = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setSubjectToUpdate(subject);
    setIsUpdateModalOpen(true);
  };

  // Calculate total pages for client-side pagination
  const totalPages = useMemo(() => {
    return Math.ceil(totalElements / pagination.pageSize);
  }, [totalElements, pagination.pageSize]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-title-lg font-medium text-gray-900 dark:text-white">Quản lý Môn học</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          + Thêm mới
        </button>
      </div>

      {/* Filters */}
      <SubjectFilters searchParams={searchParams} onFilterChange={handleFilterChange} />

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
        <SubjectListTable
          subjects={data}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onDelete={refetch}
          pagination={{
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalElements: totalElements,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      )}

      {/* Detail Modal */}
      <SubjectDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSubject(null);
        }}
        subject={selectedSubject}
      />

      {/* Create Modal */}
      <SubjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refetch}
      />

      {/* Update Modal */}
      <SubjectUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSubjectToUpdate(null);
        }}
        subject={subjectToUpdate}
        onSuccess={refetch}
      />
    </div>
  );
}


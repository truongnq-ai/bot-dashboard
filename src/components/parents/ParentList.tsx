'use client';

import React, { useState } from 'react';
import { useParents } from '@/lib/hooks/useParents';
import { ParentSearchParams, Parent } from '@/types/parent';
import ParentListTable from './ParentListTable';
import ParentFilters from './ParentFilters';
import ParentDetailModal from './ParentDetailModal';

export default function ParentList() {
  const [searchParams, setSearchParams] = useState<ParentSearchParams>({
    page: 0,
    pageSize: 10,
  });

  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data, loading, error, refetch } = useParents(searchParams);

  const handleFilterChange = (newParams: Partial<ParentSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...newParams, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setSearchParams((prev) => ({ ...prev, pageSize, page: 0 }));
  };

  const handleViewDetail = (parent: Parent) => {
    setSelectedParent(parent);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Phụ huynh</h1>
      </div>

      {/* Filters */}
      <ParentFilters searchParams={searchParams} onFilterChange={handleFilterChange} />

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
        <ParentListTable
          parents={data.content}
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

      {/* Detail Modal */}
      <ParentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedParent(null);
        }}
        parent={selectedParent}
      />
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import { useAdmins } from '@/lib/hooks/useAdmins';
import { AdminSearchParams, Admin } from '@/types/admin';
import AdminListTable from './AdminListTable';
import AdminFilters from './AdminFilters';
import AdminCreateModal from './AdminCreateModal';
import AdminDetailModal from './AdminDetailModal';

export default function AdminList() {
  const [searchParams, setSearchParams] = useState<AdminSearchParams>({
    page: 0,
    pageSize: 10,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data, loading, error, refetch } = useAdmins(searchParams);

  const handleFilterChange = (newParams: Partial<AdminSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...newParams, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setSearchParams((prev) => ({ ...prev, pageSize, page: 0 }));
  };

  const handleViewDetail = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-title-functional text-gray-900 dark:text-white">Quản lý Admin</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          + Tạo mới
        </button>
      </div>

      {/* Filters */}
      <AdminFilters searchParams={searchParams} onFilterChange={handleFilterChange} />

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
        <AdminListTable
          admins={data.content}
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
      <AdminCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refetch}
      />

      {/* Detail Modal */}
      <AdminDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
      />
    </div>
  );
}


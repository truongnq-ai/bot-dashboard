'use client';

import React, { useState, useMemo } from 'react';
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

  const statistics = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
      };
    }

    const admins = data.content || [];
    return {
      total: data.totalElements || 0,
      active: admins.filter((a) => a.status === 'ACTIVE').length,
      inactive: admins.filter((a) => a.status === 'INACTIVE').length,
    };
  }, [data]);

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Admin</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Tạo mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Tổng số</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Hoạt động</div>
          <div className="text-2xl font-bold text-green-600">{statistics.active}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Không hoạt động</div>
          <div className="text-2xl font-bold text-gray-600">{statistics.inactive}</div>
        </div>
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
          onStatusChange={refetch}
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


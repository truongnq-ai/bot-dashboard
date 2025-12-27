'use client';

import React, { useState, useMemo } from 'react';
import { useTrials } from '@/lib/hooks/useTrials';
import { TrialSearchParams, Trial } from '@/types/trial';
import TrialListTable from './TrialListTable';
import TrialFilters from './TrialFilters';
import TrialDetailModal from './TrialDetailModal';

export default function TrialList() {
  const [searchParams, setSearchParams] = useState<TrialSearchParams>({
    page: 0,
    pageSize: 10,
  });

  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data, loading, error, refetch } = useTrials(searchParams);

  const statistics = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        active: 0,
        expired: 0,
        consumed: 0,
      };
    }

    const trials = data.content || [];
    return {
      total: data.totalElements || 0,
      active: trials.filter((t) => t.trialStatus === 'ACTIVE').length,
      expired: trials.filter((t) => t.trialStatus === 'EXPIRED').length,
      consumed: trials.filter((t) => t.trialStatus === 'CONSUMED').length,
    };
  }, [data]);

  const handleFilterChange = (newParams: Partial<TrialSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...newParams, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setSearchParams((prev) => ({ ...prev, pageSize, page: 0 }));
  };

  const handleViewDetail = (trial: Trial) => {
    setSelectedTrial(trial);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Trial</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Tổng số</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Đang hoạt động</div>
          <div className="text-2xl font-bold text-green-600">{statistics.active}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Đã hết hạn</div>
          <div className="text-2xl font-bold text-yellow-600">{statistics.expired}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Đã sử dụng</div>
          <div className="text-2xl font-bold text-blue-600">{statistics.consumed}</div>
        </div>
      </div>

      {/* Filters */}
      <TrialFilters searchParams={searchParams} onFilterChange={handleFilterChange} />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-red-800 dark:text-red-200">
            Lỗi: {error.message}
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && data && (
        <TrialListTable
          trials={data.content || []}
          onStatusChange={refetch}
          onViewDetail={handleViewDetail}
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

      {/* Detail Modal */}
      {selectedTrial && (
        <TrialDetailModal
          trial={selectedTrial}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTrial(null);
          }}
          onStatusChange={refetch}
        />
      )}
    </div>
  );
}


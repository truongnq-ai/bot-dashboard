'use client';

import React, { useState, useMemo } from 'react';
import { useChapters } from '@/lib/hooks/useChapters';
import { ChapterSearchParams, Chapter } from '@/types/chapter';
import ChapterListTable from './ChapterListTable';
import ChapterFilters from './ChapterFilters';
import ChapterCreateModal from './ChapterCreateModal';
import ChapterUpdateModal from './ChapterUpdateModal';
import ChapterDetailModal from './ChapterDetailModal';

export default function ChapterList() {
  const [searchParams, setSearchParams] = useState<ChapterSearchParams>({
    page: 0,
    pageSize: 10,
  });

  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [chapterToUpdate, setChapterToUpdate] = useState<Chapter | null>(null);

  const { data, loading, error, refetch } = useChapters(searchParams);

  const statistics = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        grade6: 0,
        grade7: 0,
      };
    }

    const chapters = data.content || [];
    return {
      total: data.totalElements || 0,
      grade6: chapters.filter((c) => c.grade === 6).length,
      grade7: chapters.filter((c) => c.grade === 7).length,
    };
  }, [data]);

  const handleFilterChange = (newParams: Partial<ChapterSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...newParams, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setSearchParams((prev) => ({ ...prev, pageSize, page: 0 }));
  };

  const handleViewDetail = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (chapter: Chapter) => {
    setChapterToUpdate(chapter);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = async (chapter: Chapter) => {
    if (confirm(`Bạn có chắc chắn muốn xóa chương "${chapter.name}"?`)) {
      try {
        const { deleteChapter } = await import('@/lib/api/chapter.service');
        const response = await deleteChapter(chapter.id);
        if (response.errorCode === '0000') {
          alert('Xóa chương thành công');
          refetch();
        } else {
          alert(response.errorDetail || 'Xóa chương thất bại');
        }
      } catch (error) {
        alert('Hệ thống không có phản hồi.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Chương</h1>
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
      <ChapterFilters searchParams={searchParams} onFilterChange={handleFilterChange} />

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
        <ChapterListTable
          chapters={data.content}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
      <ChapterDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedChapter(null);
        }}
        chapter={selectedChapter}
      />

      {/* Create Modal */}
      <ChapterCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refetch}
      />

      {/* Update Modal */}
      <ChapterUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setChapterToUpdate(null);
        }}
        chapter={chapterToUpdate}
        onSuccess={refetch}
      />
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import { useTopicsTree } from '@/lib/hooks/useTopics';
import { TopicSearchParams, Topic } from '@/types/topic';
import TopicTreeTable from './TopicTreeTable';
import TopicFilters from './TopicFilters';
import TopicCreateModal from './TopicCreateModal';
import TopicUpdateModal from './TopicUpdateModal';
import TopicDetailModal from './TopicDetailModal';
import { deleteTopic } from '@/lib/api/topic.service';
import { showError, showSuccess } from '@/lib/utils/toast';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function TopicList() {
  const [searchParams, setSearchParams] = useState<TopicSearchParams>({});
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [topicToUpdate, setTopicToUpdate] = useState<Topic | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    topic: Topic | null;
  }>({
    isOpen: false,
    topic: null,
  });

  const { data, loading, error, refetch } = useTopicsTree(searchParams.subjectId);

  const handleFilterChange = (newParams: Partial<TopicSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...newParams }));
  };

  const handleViewDetail = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (topic: Topic) => {
    setTopicToUpdate(topic);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (topic: Topic) => {
    setDeleteModal({ isOpen: true, topic });
  };

  const handleDelete = async () => {
    if (!deleteModal.topic) return;

    try {
      const response = await deleteTopic(deleteModal.topic.id);
      if (response.errorCode === '0000') {
        showSuccess('Xóa topic thành công');
        setDeleteModal({ isOpen: false, topic: null });
        refetch();
      } else {
        showError(response.errorDetail || 'Xóa topic thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi xóa topic');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Topic</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Thêm mới
        </button>
      </div>

      {/* Filters */}
      <TopicFilters searchParams={searchParams} onFilterChange={handleFilterChange} />

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

      {/* Tree Table */}
      {!loading && !error && data && (
        <TopicTreeTable
          topics={data}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Detail Modal */}
      <TopicDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTopic(null);
        }}
        topic={selectedTopic}
      />

      {/* Create Modal */}
      <TopicCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refetch}
      />

      {/* Update Modal */}
      <TopicUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setTopicToUpdate(null);
        }}
        topic={topicToUpdate}
        onSuccess={refetch}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, topic: null })}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message={
          deleteModal.topic
            ? `Bạn có chắc chắn muốn xóa topic "${deleteModal.topic.name}"? Tất cả các topic con cũng sẽ bị xóa (cascade delete).`
            : ''
        }
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
}


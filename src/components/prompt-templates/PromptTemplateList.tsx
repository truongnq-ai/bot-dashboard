'use client';

import React, { useState, useMemo } from 'react';
import { PromptTemplateSearchParams, PromptTemplate } from '@/types/prompt-template';
import PromptTemplateListTable from './PromptTemplateListTable';
import PromptTemplateFilters from './PromptTemplateFilters';
import PromptTemplateDetailModal from './PromptTemplateDetailModal';
import PromptTemplateCreateModal from './PromptTemplateCreateModal';
import PromptTemplateEditModal from './PromptTemplateEditModal';
import {
  getPromptTemplates,
  deletePromptTemplate,
  activatePromptTemplate,
  deactivatePromptTemplate,
} from '@/lib/api/prompt-template.service';
import { showError, showSuccess } from '@/lib/utils/toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function PromptTemplateList() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState<PromptTemplateSearchParams>({
    page: 0,
    pageSize: 10,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['promptTemplates', searchParams],
    queryFn: () => getPromptTemplates(searchParams),
  });

  const statistics = useMemo(() => {
    if (!data?.data) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
      };
    }

    const templates = data.data.content || [];
    return {
      total: data.data.totalElements || 0,
      active: templates.filter((t) => t.isActive).length,
      inactive: templates.filter((t) => !t.isActive).length,
    };
  }, [data]);

  const handleFilterChange = (newParams: Partial<PromptTemplateSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...newParams, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setSearchParams((prev) => ({ ...prev, pageSize, page: 0 }));
  };

  const handleViewDetail = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (template: PromptTemplate) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa template "${template.name}"?`)) {
      return;
    }

    try {
      await deletePromptTemplate(template.id);
      showSuccess('Xóa prompt template thành công');
      queryClient.invalidateQueries({ queryKey: ['promptTemplates'] });
    } catch (error) {
      showError('Xóa prompt template thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  };

  const handleActivate = async (template: PromptTemplate) => {
    try {
      await activatePromptTemplate(template.id);
      showSuccess('Kích hoạt prompt template thành công');
      queryClient.invalidateQueries({ queryKey: ['promptTemplates'] });
    } catch (error) {
      showError('Kích hoạt prompt template thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  };

  const handleDeactivate = async (template: PromptTemplate) => {
    try {
      await deactivatePromptTemplate(template.id);
      showSuccess('Vô hiệu hóa prompt template thành công');
      queryClient.invalidateQueries({ queryKey: ['promptTemplates'] });
    } catch (error) {
      showError('Vô hiệu hóa prompt template thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['promptTemplates'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Prompt Templates</h1>
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
          <div className="text-sm text-gray-600 dark:text-gray-400">Đang hoạt động</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.active}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Vô hiệu hóa</div>
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{statistics.inactive}</div>
        </div>
      </div>

      {/* Filters */}
      <PromptTemplateFilters searchParams={searchParams} onFilterChange={handleFilterChange} />

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Đang tải...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600 dark:text-red-400">
          Lỗi: {error instanceof Error ? error.message : 'Lỗi không xác định'}
        </div>
      ) : (
        <PromptTemplateListTable
          templates={data?.data?.content || []}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          pagination={
            data?.data
              ? {
                  page: searchParams.page || 0,
                  pageSize: searchParams.pageSize || 10,
                  totalElements: data.data.totalElements || 0,
                  totalPages: data.data.totalPages || 0,
                  onPageChange: handlePageChange,
                  onPageSizeChange: handlePageSizeChange,
                }
              : undefined
          }
        />
      )}

      {/* Modals */}
      <PromptTemplateDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />

      <PromptTemplateCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <PromptTemplateEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        onSuccess={handleSuccess}
      />
    </div>
  );
}


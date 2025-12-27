'use client';

import React, { useState } from 'react';
import { Trial, TrialStatus } from '@/types/trial';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import ActionsDropdown from '@/components/common/ActionsDropdown';
import { ActionItem } from '@/types/common';
import { formatDate, truncateText } from '@/lib/utils/formatters';
import { updateTrialStatus } from '@/lib/api/trial.service';
import { showError, showSuccess } from '@/lib/utils/toast';
import DeviceListModal from '@/components/devices/DeviceListModal';

interface TrialListTableProps {
  trials: Trial[];
  onStatusChange?: () => void;
  onViewDetail?: (trial: Trial) => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

function TrialStatusBadge({ status }: { status: TrialStatus }) {
  const colors = {
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    EXPIRED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    CONSUMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const labels = {
    ACTIVE: 'Đang hoạt động',
    EXPIRED: 'Đã hết hạn',
    CONSUMED: 'Đã sử dụng',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default function TrialListTable({
  trials,
  onStatusChange,
  onViewDetail,
  pagination,
}: TrialListTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleStatusChange = async (trial: Trial, newStatus: TrialStatus) => {
    if (newStatus === 'CONSUMED') {
      showError('Không thể thủ công đặt trạng thái CONSUMED. Trạng thái này được tự động đặt khi liên kết phụ huynh thành công.');
      return;
    }

    const statusLabel = newStatus === 'ACTIVE' ? 'Đang hoạt động' : 'Đã hết hạn';
    if (!confirm(`Bạn có chắc muốn thay đổi trạng thái trial thành ${statusLabel}?`)) {
      return;
    }

    try {
      setUpdatingId(trial.id);
      const response = await updateTrialStatus(trial.id, newStatus);
      if (response.errorCode === '0000') {
        showSuccess('Cập nhật trạng thái thành công');
        onStatusChange?.();
      } else {
        showError(response.errorDetail || 'Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      showError('Hệ thống không có phản hồi.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getActions = (trial: Trial): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        id: 'view',
        label: 'Xem chi tiết',
        type: 'info',
        onClick: () => onViewDetail?.(trial),
      },
      {
        id: 'devices',
        label: 'Danh sách thiết bị',
        type: 'info',
        onClick: () => {
          setSelectedUserId(trial.userId);
          setDeviceModalOpen(true);
        },
      },
    ];

    // Only allow ACTIVE ↔ EXPIRED transitions, not CONSUMED
    if (trial.trialStatus === 'ACTIVE') {
      actions.push({
        id: 'expire',
        label: 'Đánh dấu hết hạn',
        type: 'warning',
        onClick: () => handleStatusChange(trial, 'EXPIRED'),
        disabled: updatingId === trial.id,
      });
    } else if (trial.trialStatus === 'EXPIRED') {
      actions.push({
        id: 'activate',
        label: 'Kích hoạt lại',
        type: 'success',
        onClick: () => handleStatusChange(trial, 'ACTIVE'),
        disabled: updatingId === trial.id,
      });
    }

    return actions;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-hidden overflow-y-visible rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto no-scrollbar">
          <div className="min-w-[1400px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    User ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Trạng thái
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Bắt đầu
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Hết hạn
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Còn lại
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Phụ huynh
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Bài tập
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Kỹ năng
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {trials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy trial nào
                    </TableCell>
                  </TableRow>
                ) : (
                  trials.map((trial) => (
                    <TableRow key={trial.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-theme-sm dark:text-white/90 font-mono">
                        {truncateText(trial.userId, 12)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <TrialStatusBadge status={trial.trialStatus} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(trial.trialStartedAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(trial.expiresAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {trial.daysRemaining > 0 ? `${trial.daysRemaining} ngày` : 'Đã hết'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {trial.linkedParentName || '-'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {trial.totalExercises}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {trial.skillsLearned}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <ActionsDropdown actions={getActions(trial)} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Hiển thị {pagination.page * pagination.pageSize + 1} đến{' '}
            {Math.min((pagination.page + 1) * pagination.pageSize, pagination.totalElements)} trong tổng số{' '}
            {pagination.totalElements} kết quả
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Trang {pagination.page + 1} / {pagination.totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      <DeviceListModal
        userId={selectedUserId || ''}
        isOpen={deviceModalOpen}
        onClose={() => {
          setDeviceModalOpen(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
}


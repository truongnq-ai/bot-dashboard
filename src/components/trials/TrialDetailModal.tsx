'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Trial, TrialStatus } from '@/types/trial';
import { formatDateTime } from '@/lib/utils/formatters';
import { updateTrialStatus } from '@/lib/api/trial.service';
import { showError, showSuccess } from '@/lib/utils/toast';

interface TrialDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trial: Trial | null;
  onStatusChange?: () => void;
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

export default function TrialDetailModal({
  isOpen,
  onClose,
  trial,
  onStatusChange,
}: TrialDetailModalProps) {
  const [updating, setUpdating] = useState(false);

  if (!trial) return null;

  const handleStatusChange = async (newStatus: TrialStatus) => {
    if (newStatus === 'CONSUMED') {
      showError('Không thể thủ công đặt trạng thái CONSUMED. Trạng thái này được tự động đặt khi liên kết phụ huynh thành công.');
      return;
    }

    const statusLabel = newStatus === 'ACTIVE' ? 'Đang hoạt động' : 'Đã hết hạn';
    if (!confirm(`Bạn có chắc muốn thay đổi trạng thái trial thành ${statusLabel}?`)) {
      return;
    }

    try {
      setUpdating(true);
      const response = await updateTrialStatus(trial.id, newStatus);
      if (response.errorCode === '0000') {
        showSuccess('Cập nhật trạng thái thành công');
        onStatusChange?.();
        onClose();
      } else {
        showError(response.errorDetail || 'Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      showError('Hệ thống không có phản hồi.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chi tiết Trial</h2>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trial ID
                </label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">{trial.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User ID
                </label>
                <p className="text-sm text-gray-900 dark:text-white font-mono break-all">{trial.userId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lớp
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {trial.grade ? `Lớp ${trial.grade}` : '-'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trạng thái
                </label>
                <div className="mt-1">
                  <TrialStatusBadge status={trial.trialStatus} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ngày bắt đầu
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDateTime(trial.trialStartedAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ngày hết hạn
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDateTime(trial.expiresAt)}
                </p>
              </div>

              {trial.consumedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ngày sử dụng
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDateTime(trial.consumedAt)}
                  </p>
                </div>
              )}

              {trial.linkedAccountId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phụ huynh đã liên kết
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {trial.linkedParentName || trial.linkedAccountId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thống kê</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số ngày đã dùng
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{trial.daysUsed} ngày</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số ngày còn lại
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {trial.daysRemaining > 0 ? `${trial.daysRemaining} ngày` : 'Đã hết'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tổng số bài tập
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{trial.totalExercises}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số kỹ năng đã học
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{trial.skillsLearned}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {trial.trialStatus !== 'CONSUMED' && (
            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              {trial.trialStatus === 'ACTIVE' ? (
                <button
                  onClick={() => handleStatusChange('EXPIRED')}
                  disabled={updating}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  Đánh dấu hết hạn
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange('ACTIVE')}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Kích hoạt lại
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}


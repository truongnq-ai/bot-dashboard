'use client';

import React, { useState } from 'react';
import { Admin } from '@/types/admin';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import ActionsDropdown from '@/components/common/ActionsDropdown';
import { ActionItem } from '@/types/common';
import { formatDate, truncateText } from '@/lib/utils/formatters';
import { resetUserPassword } from '@/lib/api/admin.service';
import { showError, showSuccess } from '@/lib/utils/toast';
import AlertModal from '@/components/common/AlertModal';
import ConfirmModal from '@/components/common/ConfirmModal';

interface AdminListTableProps {
  admins: Admin[];
  onViewDetail?: (admin: Admin) => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

export default function AdminListTable({
  admins,
  onViewDetail,
  pagination,
}: AdminListTableProps) {
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    admin: Admin | null;
  }>({
    isOpen: false,
    admin: null,
  });
  const [resetPasswordModal, setResetPasswordModal] = useState<{
    isOpen: boolean;
    username: string;
    password: string;
  }>({
    isOpen: false,
    username: '',
    password: '',
  });
  const [copied, setCopied] = useState(false);

  const handleCopy = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      showSuccess('Đã copy mật khẩu vào clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showError('Không thể copy mật khẩu. Vui lòng copy thủ công.');
    }
  };

  const handleResetPasswordClick = (admin: Admin) => {
    setConfirmModal({
      isOpen: true,
      admin,
    });
  };

  const handleConfirmResetPassword = async () => {
    if (!confirmModal.admin) return;

    try {
      setResettingId(confirmModal.admin.id);
      const response = await resetUserPassword(confirmModal.admin.id);
      if (response.errorCode === '0000' && response.data) {
        setResetPasswordModal({
          isOpen: true,
          username: response.data.username,
          password: response.data.newPassword,
        });
      } else {
        showError(response.errorDetail || 'Reset mật khẩu thất bại');
      }
    } catch (error) {
      showError('Hệ thống không có phản hồi.');
    } finally {
      setResettingId(null);
      setConfirmModal({ isOpen: false, admin: null });
    }
  };

  const getActions = (admin: Admin): ActionItem[] => {
    return [
      {
        id: 'view',
        label: 'Xem chi tiết',
        type: 'success',
        onClick: () => onViewDetail?.(admin),
      },
      {
        id: 'reset-password',
        label: 'Reset mật khẩu',
        type: 'warning',
        onClick: () => handleResetPasswordClick(admin),
        disabled: resettingId === admin.id,
      },
    ];
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-hidden overflow-y-visible rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto no-scrollbar">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Username
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Tên
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Role
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Ngày tạo
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy người dùng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-theme-sm dark:text-white/90">
                        {truncateText(admin.id, 8)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 text-start text-theme-sm dark:text-white font-medium">
                        {admin.username}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 text-start text-theme-sm dark:text-white">
                        {admin.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400">
                          {admin.role || 'ADMIN'}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(admin.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <ActionsDropdown actions={getActions(admin)} />
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
          <div className="text-theme-sm text-gray-700 dark:text-gray-300">
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
            <span className="text-theme-sm text-gray-700 dark:text-gray-300">
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

      {/* Confirm Reset Password Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, admin: null })}
        onConfirm={handleConfirmResetPassword}
        variant="warning"
        title="Xác nhận reset mật khẩu"
        message={`Bạn có chắc muốn reset mật khẩu cho ${confirmModal.admin?.username}?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        isLoading={resettingId === confirmModal.admin?.id}
      />

      {/* Reset Password Result Modal */}
      <AlertModal
        isOpen={resetPasswordModal.isOpen}
        onClose={() => {
          setResetPasswordModal({ isOpen: false, username: '', password: '' });
          setCopied(false);
        }}
        variant="info"
        title="Reset mật khẩu thành công"
        content={
          <div>
            <p className="text-theme-sm text-gray-700 dark:text-gray-300 mb-3">
              Mật khẩu mới cho tài khoản <strong>{resetPasswordModal.username}</strong> là:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-lg font-mono font-bold text-gray-900 dark:text-white">
                {resetPasswordModal.password}
              </code>
              <button
                onClick={() => handleCopy(resetPasswordModal.password)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-brand-500 text-white hover:bg-brand-600'
                }`}
              >
                {copied ? '✓ Đã copy' : 'Copy'}
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
}


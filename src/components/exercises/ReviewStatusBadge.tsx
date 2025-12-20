/**
 * Review Status Badge Component
 */

import React from 'react';
import { ReviewStatus } from '@/types/exercise';

interface ReviewStatusBadgeProps {
  status: ReviewStatus;
  className?: string;
}

export default function ReviewStatusBadge({ status, className = '' }: ReviewStatusBadgeProps) {
  const getStatusConfig = (status: ReviewStatus) => {
    switch (status) {
      case ReviewStatus.PENDING:
        return {
          label: 'Chờ duyệt',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          darkBgColor: 'dark:bg-yellow-900',
          darkTextColor: 'dark:text-yellow-300',
        };
      case ReviewStatus.APPROVED:
        return {
          label: 'Đã duyệt',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          darkBgColor: 'dark:bg-green-900',
          darkTextColor: 'dark:text-green-300',
        };
      case ReviewStatus.REJECTED:
        return {
          label: 'Đã từ chối',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          darkBgColor: 'dark:bg-red-900',
          darkTextColor: 'dark:text-red-300',
        };
      case ReviewStatus.NEEDS_REVISION:
        return {
          label: 'Cần chỉnh sửa',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          darkBgColor: 'dark:bg-orange-900',
          darkTextColor: 'dark:text-orange-300',
        };
      default:
        return {
          label: status,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          darkBgColor: 'dark:bg-gray-800',
          darkTextColor: 'dark:text-gray-300',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${config.darkBgColor} ${config.darkTextColor} ${className}`}
    >
      {config.label}
    </span>
  );
}

'use client';

import React from 'react';

interface ParentStatusBadgeProps {
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
}

export default function ParentStatusBadge({ status }: ParentStatusBadgeProps) {
  const statusConfig = {
    ACTIVE: {
      label: 'Hoạt động',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    INACTIVE: {
      label: 'Không hoạt động',
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    },
    LOCKED: {
      label: 'Đã khóa',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
  };

  const config = statusConfig[status] || {
    label: status || 'Không xác định',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}


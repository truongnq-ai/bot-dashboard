/**
 * Toast Alert Wrapper Component
 * 
 * Wrapper for Alert component to be used in toast notifications.
 * Automatically sets title based on variant.
 */

'use client';

import React from 'react';
import Alert from './Alert';

export interface ToastAlertOptions {
  showLink?: boolean;
  linkHref?: string;
  linkText?: string;
}

interface ToastAlertProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  message: string;
  showLink?: boolean;
  linkHref?: string;
  linkText?: string;
}

// Title mapping based on variant
const variantTitles = {
  success: 'Thành công',
  warning: 'Cảnh báo',
  error: 'Lỗi',
  info: 'Thông tin',
};

const ToastAlert: React.FC<ToastAlertProps> = ({
  variant,
  message,
  showLink = false,
  linkHref,
  linkText = 'Tìm hiểu thêm',
}) => {
  return (
    <Alert
      variant={variant}
      title={variantTitles[variant]}
      message={message}
      showLink={showLink && !!linkHref}
      linkHref={linkHref}
      linkText={linkText}
    />
  );
};

export default ToastAlert;


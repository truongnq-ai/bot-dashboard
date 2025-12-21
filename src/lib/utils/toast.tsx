/**
 * Toast Notification Utilities
 * 
 * Uses custom Alert component from tutor-parent-dashboard for consistent UI
 */

'use client';

import React from 'react';
import toast from 'react-hot-toast';
import ToastAlert, { ToastAlertOptions } from '@/components/ui/alert/ToastAlert';

/**
 * Show success toast with custom Alert component
 */
export function showSuccess(message: string, options?: ToastAlertOptions) {
  toast.custom(
    (t) => (
      <div
        style={{
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <ToastAlert
          variant="success"
          message={message}
          showLink={options?.showLink}
          linkHref={options?.linkHref}
          linkText={options?.linkText}
        />
      </div>
    ),
    {
      duration: 4000,
    }
  );
}

/**
 * Show error toast with custom Alert component
 */
export function showError(message: string, options?: ToastAlertOptions) {
  toast.custom(
    (t) => (
      <div
        style={{
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <ToastAlert
          variant="error"
          message={message}
          showLink={options?.showLink}
          linkHref={options?.linkHref}
          linkText={options?.linkText}
        />
      </div>
    ),
    {
      duration: 4000,
    }
  );
}

/**
 * Show warning toast with custom Alert component
 */
export function showWarning(message: string, options?: ToastAlertOptions) {
  toast.custom(
    (t) => (
      <div
        style={{
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <ToastAlert
          variant="warning"
          message={message}
          showLink={options?.showLink}
          linkHref={options?.linkHref}
          linkText={options?.linkText}
        />
      </div>
    ),
    {
      duration: 4000,
    }
  );
}

/**
 * Show info toast with custom Alert component
 */
export function showInfo(message: string, options?: ToastAlertOptions) {
  toast.custom(
    (t) => (
      <div
        style={{
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <ToastAlert
          variant="info"
          message={message}
          showLink={options?.showLink}
          linkHref={options?.linkHref}
          linkText={options?.linkText}
        />
      </div>
    ),
    {
      duration: 4000,
    }
  );
}

/**
 * Show loading toast
 */
export function showLoading(message: string) {
  return toast.loading(message);
}

/**
 * Update toast (for loading states)
 */
export function updateToast(toastId: string, type: 'success' | 'error' | 'warning' | 'info', message: string, options?: ToastAlertOptions) {
  toast.dismiss(toastId);
  if (type === 'success') {
    showSuccess(message, options);
  } else if (type === 'error') {
    showError(message, options);
  } else if (type === 'warning') {
    showWarning(message, options);
  } else {
    showInfo(message, options);
  }
}


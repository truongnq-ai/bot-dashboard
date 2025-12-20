/**
 * Toast Notification Utilities
 */

import toast from 'react-hot-toast';

/**
 * Show success toast
 */
export function showSuccess(message: string) {
  toast.success(message);
}

/**
 * Show error toast
 */
export function showError(message: string) {
  toast.error(message);
}

/**
 * Show info toast
 */
export function showInfo(message: string) {
  toast(message, {
    icon: 'ℹ️',
  });
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
export function updateToast(toastId: string, type: 'success' | 'error' | 'info', message: string) {
  toast.dismiss(toastId);
  if (type === 'success') {
    toast.success(message);
  } else if (type === 'error') {
    toast.error(message);
  } else {
    toast(message);
  }
}

/**
 * Error Handler Utilities
 * 
 * Provides consistent error handling and toast notifications
 * based on HTTP status codes and error types.
 */

import { AxiosError } from 'axios';
import { showError, showWarning, showSuccess } from './toast';

export interface ApiErrorResponse {
  errorCode?: string;
  errorDetail?: string;
  message?: string;
}

/**
 * Handle API error and show appropriate toast notification
 * 
 * @param error - The error object (can be AxiosError, ResponseObject, or any Error)
 * @param defaultMessage - Default error message if error details are not available
 */
export function handleApiError(error: unknown, defaultMessage: string = 'Đã xảy ra lỗi'): void {
  // Handle Axios errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const errorData = axiosError.response?.data;

    if (status === 401 || status === 403) {
      showError('Không có quyền truy cập. Vui lòng đăng nhập lại.');
      return;
    }

    if (status && status >= 500) {
      showError('Lỗi hệ thống. Vui lòng thử lại sau.');
      return;
    }

    if (status === 400) {
      // Business logic errors - show as warning
      const errorDetail = errorData?.errorDetail || errorData?.message || defaultMessage;
      const errorCode = errorData?.errorCode;
      
      // Error codes starting with 3 are resource/business logic errors (show as warning)
      if (errorCode && (errorCode.startsWith('3') || errorCode.startsWith('2'))) {
        showWarning(errorDetail);
      } else {
        showWarning(errorDetail);
      }
      return;
    }

    // Other 4xx errors
    if (status && status >= 400 && status < 500) {
      const errorDetail = errorData?.errorDetail || errorData?.message || defaultMessage;
      showWarning(errorDetail);
      return;
    }
  }

  // Handle ResponseObject directly (non-axios errors)
  if (error && typeof error === 'object' && 'errorCode' in error) {
    const responseObj = error as ApiErrorResponse;
    const errorCode = responseObj.errorCode;
    const errorDetail = responseObj.errorDetail || responseObj.message || defaultMessage;
    
    // Business logic errors (3xxx, 2xxx) - show as warning
    if (errorCode && (errorCode.startsWith('3') || errorCode.startsWith('2'))) {
      showWarning(errorDetail);
    } else {
      showError(errorDetail);
    }
    return;
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    showError(error.message || defaultMessage);
    return;
  }

  // Fallback
  showError(defaultMessage);
}

/**
 * Handle API success response
 * 
 * @param message - Success message to display
 */
export function handleApiSuccess(message: string): void {
  showSuccess(message);
}


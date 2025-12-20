/**
 * Error Handler Utilities
 */

import { ResponseObject } from '../../types/common';

/**
 * Error codes mapping
 */
export const ERROR_CODES = {
  SUCCESS: '0000',
  UNAUTHORIZED: '1006',
  FORBIDDEN: '1007',
  NOT_FOUND: '3001',
  VALIDATION_ERROR: '4003',
  INTERNAL_SERVER_ERROR: '5001',
} as const;

/**
 * Handle API error and return user-friendly message
 */
export function handleApiError<T>(response: ResponseObject<T> | null): string {
  if (!response) {
    return 'Đã xảy ra lỗi không mong muốn';
  }

  if (response.errorCode === ERROR_CODES.SUCCESS) {
    return '';
  }

  // Map error codes to user-friendly messages
  switch (response.errorCode) {
    case ERROR_CODES.UNAUTHORIZED:
      return 'Bạn không được phép thực hiện hành động này. Vui lòng đăng nhập lại.';
    case ERROR_CODES.FORBIDDEN:
      return 'Bạn không có quyền thực hiện hành động này.';
    case ERROR_CODES.NOT_FOUND:
      return 'Không tìm thấy tài nguyên được yêu cầu.';
    case ERROR_CODES.VALIDATION_ERROR:
      return response.errorDetail || 'Lỗi xác thực. Vui lòng kiểm tra thông tin nhập vào.';
    case ERROR_CODES.INTERNAL_SERVER_ERROR:
      return 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.';
    default:
      return response.errorDetail || 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }
}

/**
 * Check if response is successful
 */
export function isSuccessResponse<T>(response: ResponseObject<T> | null): boolean {
  return response?.errorCode === ERROR_CODES.SUCCESS;
}

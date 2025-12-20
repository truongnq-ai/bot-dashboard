/**
 * Error Handler Utilities
 */

import { ResponseObject } from '../types/common';

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
    return 'An unexpected error occurred';
  }

  if (response.errorCode === ERROR_CODES.SUCCESS) {
    return '';
  }

  // Map error codes to user-friendly messages
  switch (response.errorCode) {
    case ERROR_CODES.UNAUTHORIZED:
      return 'You are not authorized to perform this action. Please log in again.';
    case ERROR_CODES.FORBIDDEN:
      return 'You do not have permission to perform this action.';
    case ERROR_CODES.NOT_FOUND:
      return 'The requested resource was not found.';
    case ERROR_CODES.VALIDATION_ERROR:
      return response.errorDetail || 'Validation error. Please check your input.';
    case ERROR_CODES.INTERNAL_SERVER_ERROR:
      return 'An internal server error occurred. Please try again later.';
    default:
      return response.errorDetail || 'An error occurred. Please try again.';
  }
}

/**
 * Check if response is successful
 */
export function isSuccessResponse<T>(response: ResponseObject<T> | null): boolean {
  return response?.errorCode === ERROR_CODES.SUCCESS;
}

/**
 * Common Types
 */

/**
 * Standard API response object
 */
export interface ResponseObject<T> {
  errorCode: string;
  errorDetail: string;
  data: T | null;
}

/**
 * Paginated response
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

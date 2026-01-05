import { ReactNode } from 'react';

/**
 * Action item for ActionsDropdown component
 */
export interface ActionItem {
  id: string;
  label: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export interface ResponseObject<T> {
  errorCode: string;
  errorDetail: string;
  data: T | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface ResetPasswordResponse {
  id: string;
  username: string;
  newPassword: string;
}

/**
 * Sort request for pagination
 */
export interface SortRequest {
  property: string;
  direction: 'ASC' | 'DESC';
}

/**
 * Page request for paginated API endpoints using POST getPage pattern.
 * Uses 0-based page numbering to be compatible with Spring Data.
 */
export interface PageRequest {
  page: number; // 0-based
  pageSize: number;
  sort?: SortRequest[];
  dataRequest?: any; // Will be UserPageRequest for user management
}

/**
 * Filter request for user pagination.
 * Used as dataRequest in PageRequest for filtering users.
 */
export interface UserPageRequest {
  role?: 'ADMIN' | 'TEACHER';
  username?: string;
  name?: string;
}


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


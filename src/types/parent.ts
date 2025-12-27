/**
 * Parent Management Types
 */

import { ResponseObject, PageResponse } from './common';

export interface Parent {
  id: string;
  userId: string;
  username: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  phoneVerified?: boolean;
  emailVerified?: boolean;
  linkedStudentsCount?: number;
  lastLoginAt?: string;
  createdAt: string;
}

export interface ParentSearchParams {
  searchText?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  phoneVerified?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface UpdateParentStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
}

export type ParentListResponse = ResponseObject<PageResponse<Parent>>;
export type ParentResponse = ResponseObject<Parent>;


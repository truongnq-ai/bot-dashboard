/**
 * Admin Management Types
 */

import { ResponseObject, PageResponse } from './common';

export interface Admin {
  id: string;
  userId: string;
  username: string;
  email: string;
  emailVerified?: boolean;
  userType: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_ACTIVATION' | 'LOCKED';
  name: string;
  department?: string;
  role?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminSearchParams {
  searchText?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING_ACTIVATION' | 'LOCKED';
  role?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface AdminRegistrationRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  department?: string;
}

export interface UpdateAdminStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_ACTIVATION' | 'LOCKED';
}

export type AdminListResponse = ResponseObject<PageResponse<Admin>>;
export type AdminResponse = ResponseObject<Admin>;


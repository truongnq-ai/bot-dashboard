/**
 * Admin Management Types
 */

import { ResponseObject, PageResponse } from './common';

export interface Admin {
  id: string;
  userId: string;
  username: string;
  name: string;
  role?: string;
  createdAt: string;
}

export interface AdminSearchParams {
  role?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminRegistrationRequest {
  username: string;
  password: string;
  name: string;
  role: string;
}


export type AdminListResponse = ResponseObject<PageResponse<Admin>>;
export type AdminResponse = ResponseObject<Admin>;


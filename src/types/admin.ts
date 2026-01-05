/**
 * Admin Management Types
 */

import { ResponseObject, PageResponse } from './common';

/**
 * Admin user response matching UserResponse from backend
 */
export interface Admin {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN';
  createdAt: string;
}

/**
 * Search parameters for admin list
 * Note: role is always 'ADMIN' but included for consistency
 */
export interface AdminSearchParams {
  role?: 'ADMIN';
  username?: string;
  name?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Request to create a new admin user
 */
export interface CreateUserRequest {
  username: string;
  password: string;
  name: string;
  role: 'ADMIN';
}

/**
 * Legacy type name for backward compatibility
 * @deprecated Use CreateUserRequest instead
 */
export type AdminRegistrationRequest = CreateUserRequest;

export type AdminListResponse = ResponseObject<PageResponse<Admin>>;
export type AdminResponse = ResponseObject<Admin>;


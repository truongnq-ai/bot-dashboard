/**
 * Teacher Management Types
 */

import { ResponseObject, PageResponse } from './common';

/**
 * Teacher user response matching UserResponse from backend
 */
export interface Teacher {
  id: string;
  username: string;
  name: string;
  role: 'TEACHER';
  createdAt: string;
}

/**
 * Search parameters for teacher list
 * Note: role is always 'TEACHER' but included for consistency
 */
export interface TeacherSearchParams {
  role?: 'TEACHER';
  username?: string;
  name?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Request to create a new teacher user
 */
export interface CreateUserRequest {
  username: string;
  password: string;
  name: string;
  role: 'TEACHER';
}

export type TeacherListResponse = ResponseObject<PageResponse<Teacher>>;
export type TeacherResponse = ResponseObject<Teacher>;


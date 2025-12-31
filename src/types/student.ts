/**
 * Student Management Types
 */

import { ResponseObject, PageResponse } from './common';

export interface Student {
  id: string;
  userId: string;
  username: string;
  name: string;
  role?: string;
  grade?: number;
  parentName?: string;
  createdAt: string;
}

export interface StudentSearchParams {
  role?: string;
  page?: number;
  pageSize?: number;
}

export type StudentListResponse = ResponseObject<PageResponse<Student>>;
export type StudentResponse = ResponseObject<Student>;


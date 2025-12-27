/**
 * Student Management Types
 */

import { ResponseObject, PageResponse } from './common';

export interface Student {
  id: string;
  userId: string;
  username: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  phoneVerified?: boolean;
  emailVerified?: boolean;
  grade?: number;
  studentStatus?: 'PENDING' | 'LINKED' | 'ACTIVE' | 'INACTIVE';
  parentId?: string;
  parentName?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface StudentSearchParams {
  searchText?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  studentStatus?: 'PENDING' | 'LINKED' | 'ACTIVE' | 'INACTIVE';
  grade?: number;
  parentId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface UpdateStudentStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
}

export type StudentListResponse = ResponseObject<PageResponse<Student>>;
export type StudentResponse = ResponseObject<Student>;


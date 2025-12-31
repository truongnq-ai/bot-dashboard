/**
 * Parent Management Types
 */

import { ResponseObject, PageResponse } from './common';

export interface Parent {
  id: string;
  userId: string;
  username: string;
  name: string;
  role?: string;
  linkedStudentsCount?: number;
  createdAt: string;
}

export interface ParentSearchParams {
  role?: string;
  page?: number;
  pageSize?: number;
}

export type ParentListResponse = ResponseObject<PageResponse<Parent>>;
export type ParentResponse = ResponseObject<Parent>;


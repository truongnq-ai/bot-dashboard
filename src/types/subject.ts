/**
 * Subject Types
 */

import { ResponseObject } from './common';

// Subject Entity
export interface Subject {
  id: string;
  name: string;
  orderIndex?: number;
  createdAt: string;
  updatedAt?: string;
}

// Search Params (for client-side filtering)
export interface SubjectSearchParams {
  name?: string;
}

// Request DTOs
export interface CreateSubjectRequest {
  name: string;
  orderIndex?: number;
}

export interface UpdateSubjectRequest {
  name?: string;
  orderIndex?: number;
}

// Response DTOs
export interface SubjectListResponse extends ResponseObject<Subject[]> {}

export interface SubjectResponse extends ResponseObject<Subject> {}


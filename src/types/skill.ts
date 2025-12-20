/**
 * Skill Types
 */

import { ResponseObject, PageResponse } from './common';

// Skill Entity
export interface Skill {
  id: string;
  code: string;
  grade: number;
  chapter: string;
  name: string;
  prerequisiteIds?: string[];
  prerequisites?: Skill[];
  createdAt: string;
  updatedAt?: string;
}

// Search Params
export interface SkillSearchParams {
  searchText?: string;
  grade?: 6 | 7;
  chapter?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Request DTOs
export interface CreateSkillRequest {
  code: string;
  grade: 6 | 7;
  chapter: string;
  name: string;
  prerequisiteIds?: string[];
}

// Response DTOs
export interface SkillListResponse extends PageResponse<Skill> {}

export interface SkillResponse extends ResponseObject<Skill> {}

export interface SkillListResponseData extends ResponseObject<SkillListResponse> {}

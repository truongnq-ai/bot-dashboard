/**
 * Chapter Types
 */

import { ResponseObject, PageResponse } from './common';

// Chapter Entity
export interface Chapter {
  id: string;
  grade: 6 | 7;
  code: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

// Search Params
export interface ChapterSearchParams {
  grade?: 6 | 7;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Request DTOs
export interface CreateChapterRequest {
  grade: 6 | 7;
  code: string;
  name: string;
  description?: string;
}

export interface UpdateChapterRequest {
  code?: string;
  name?: string;
  description?: string;
}

// Chapter Skill Types
export interface ChapterSkillDetail {
  skillId: string;
  skillCode: string;
  skillName: string;
  skillDescription?: string;
  skillType: 'REQUIRED' | 'OPTIONAL';
}

export interface AddChapterSkillRequest {
  skillId: string;
  skillType: 'REQUIRED' | 'OPTIONAL';
}

// Response DTOs
export interface ChapterListResponse extends PageResponse<Chapter> {}

export interface ChapterResponse extends ResponseObject<Chapter> {}

export interface ChapterListResponseData extends ResponseObject<ChapterListResponse> {}

export interface ChapterSkillsResponse extends ResponseObject<ChapterSkillDetail[]> {}


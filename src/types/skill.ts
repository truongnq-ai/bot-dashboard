/**
 * Skill Types
 */

import { ResponseObject, PageResponse } from './common';

// Skill Entity
export interface Skill {
  id: string;
  code: string;
  grade: number;
  chapterId: string;
  chapterName?: string;
  chapter?: Chapter;
  name: string;
  description?: string;
  prerequisiteIds?: string[];
  prerequisiteNames?: string[];
  prerequisites?: Skill[];
  createdAt: string;
  updatedAt?: string;
}

import { Chapter } from './chapter';

// Search Params
export interface SkillSearchParams {
  grade?: 6 | 7;
  chapterId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Request DTOs
export interface CreateSkillRequest {
  code: string;
  grade: 6 | 7;
  chapterId: string;
  name: string;
  description?: string;
  prerequisiteIds?: string[];
}

export interface UpdateSkillRequest {
  code?: string;
  grade?: 6 | 7;
  chapterId?: string;
  name?: string;
  description?: string;
  prerequisiteIds?: string[];
}

// Response DTOs
export interface SkillListResponse extends PageResponse<Skill> {}

export interface SkillResponse extends ResponseObject<Skill> {}

export interface SkillListResponseData extends ResponseObject<SkillListResponse> {}

// Prerequisite Detail
export interface SkillPrerequisiteDetail {
  skillId: string;
  skillCode: string;
  skillName: string;
  skillDescription?: string;
}

// Prerequisite Request
export interface AddSkillPrerequisiteRequest {
  prerequisiteSkillId: string;
}

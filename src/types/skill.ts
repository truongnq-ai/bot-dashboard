/**
 * Skill Types
 */

import { ResponseObject, PageResponse } from './common';

// Skill Entity
export interface Skill {
  id: string;
  name: string;
  description?: string;
  grade?: number;
  subject?: string;
  parentSkillId?: string;
  createdAt: string;
  updatedAt: string;
}

// Response DTOs
export interface SkillListResponse extends PageResponse<Skill> {}

export interface SkillResponse extends ResponseObject<Skill> {}

export interface SkillListResponseData extends ResponseObject<SkillListResponse> {}

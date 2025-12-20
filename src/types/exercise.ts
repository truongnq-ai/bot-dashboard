/**
 * Exercise Types
 */

import { ResponseObject, PageResponse } from './common';

// Enums
export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVISION = 'NEEDS_REVISION',
}

export enum BloomTaxonomyLevel {
  REMEMBER = 'REMEMBER',
  UNDERSTAND = 'UNDERSTAND',
  APPLY = 'APPLY',
  ANALYZE = 'ANALYZE',
  EVALUATE = 'EVALUATE',
  CREATE = 'CREATE',
}

// Solution Step
export interface SolutionStep {
  stepNumber: number;
  description?: string;
  content: string;
  explanation?: string;
}

export interface SolutionStepRequest {
  stepNumber: number;
  description?: string;
  content: string;
  explanation?: string;
}

// Common Mistake
export interface CommonMistake {
  mistake: string;
  explanation?: string;
}

export interface CommonMistakeRequest {
  mistake: string;
  explanation?: string;
}

// Exercise Entity
export interface Exercise {
  id: string;
  skillId: string;
  grade: number; // 6 or 7
  chapter?: string;
  problemType?: string;
  problemText: string;
  problemLatex?: string;
  problemImageUrl?: string;
  difficultyLevel?: number; // 1-5
  bloomTaxonomyLevel?: BloomTaxonomyLevel;
  solutionSteps: SolutionStep[];
  finalAnswer?: string;
  commonMistakes?: CommonMistake[];
  learningObjective?: string;
  prerequisiteSkillIds?: string[];
  timeEstimateSec?: number;
  hints?: string[];
  tags?: string[];
  createdBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewStatus: ReviewStatus;
  qualityScore?: number; // 0.0 to 1.0
  usageCount: number;
  avgSuccessRate?: number;
  avgTimeSec?: number;
  version: number;
  parentExerciseId?: string;
  createdAt: string;
  updatedAt: string;
}

// Request DTOs
export interface CreateExerciseRequest {
  skillId: string;
  grade: number; // 6 or 7
  chapter?: string;
  problemType?: string;
  problemText: string;
  problemLatex?: string;
  problemImageUrl?: string;
  difficultyLevel?: number; // 1-5
  bloomTaxonomyLevel?: BloomTaxonomyLevel;
  solutionSteps: SolutionStepRequest[];
  finalAnswer?: string;
  commonMistakes?: CommonMistakeRequest[];
  learningObjective?: string;
  prerequisiteSkillIds?: string[];
  timeEstimateSec?: number;
  hints?: string[];
  tags?: string[];
}

export interface UpdateExerciseRequest {
  skillId?: string;
  grade?: number; // 6 or 7
  chapter?: string;
  problemType?: string;
  problemText?: string;
  problemLatex?: string;
  problemImageUrl?: string;
  difficultyLevel?: number; // 1-5
  bloomTaxonomyLevel?: BloomTaxonomyLevel;
  solutionSteps?: SolutionStepRequest[];
  finalAnswer?: string;
  commonMistakes?: CommonMistakeRequest[];
  learningObjective?: string;
  prerequisiteSkillIds?: string[];
  timeEstimateSec?: number;
  hints?: string[];
  tags?: string[];
}

export interface ReviewExerciseRequest {
  reviewStatus: ReviewStatus;
  qualityScore?: number; // 0.0 to 1.0
  reviewNotes?: string;
}

// Search Params
export interface ExerciseSearchParams {
  skillId?: string;
  grade?: number;
  reviewStatus?: ReviewStatus;
  difficultyLevel?: number;
  searchText?: string;
  page?: number;
  pageSize?: number;
}

// Response DTOs
export interface ExerciseListResponse extends PageResponse<Exercise> {}

export interface ExerciseResponse extends ResponseObject<Exercise> {}

export interface ExerciseListResponseData extends ResponseObject<ExerciseListResponse> {}

export interface ExerciseStatsResponse {
  exerciseId: string;
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  avgSuccessRate: number;
  avgTimeSec: number;
  usageCount: number;
  lastUsedAt?: string;
}

export interface ExerciseReviewLog {
  id: string;
  exerciseId: string;
  reviewedBy: string;
  reviewedAt: string;
  reviewStatus: ReviewStatus;
  qualityScore?: number;
  reviewNotes?: string;
}

/**
 * Exercise Types
 */

import { ResponseObject, PageResponse } from './common';
import { Chapter } from './chapter';

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
  skillName?: string;
  grade: number; // 6 or 7
  chapterId?: string;
  chapterName?: string;
  chapter?: Chapter;
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
  chapterId: string; // UUID, required
  skillId: string; // UUID, required
  contentText: string; // Required (mapped from problemText)
  contentLatex?: string; // Optional (mapped from problemLatex)
  difficulty: number; // 1-5, required (mapped from difficultyLevel)
  createdBy: string; // Required, e.g., 'ADMIN'
  status: string; // Required, e.g., 'DRAFT'
  learningObjective?: string;
  commonMistakes?: CommonMistakeRequest[];
  hints?: string[];
}

// Solution is created separately after exercise creation
export interface CreateExerciseSolutionRequest {
  solutionSteps: string; // JSON string of SolutionStepRequest[]
  finalAnswer?: string;
  explanation?: string;
  createdBy: string; // Required, e.g., 'ADMIN'
}

// JSON Import Request
export interface ImportExerciseJsonRequest {
  rawExerciseJson: string; // JSON string containing exercise data
}

export interface ValidateJsonRequest {
  rawExerciseJson: string;
}

export interface ValidateJsonResponse {
  isValid: boolean;
  message: string;
}

export interface UpdateExerciseRequest {
  skillId?: string;
  grade?: number; // 6 or 7
  chapterId?: string;
  chapterName?: string;
  chapter?: Chapter;
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
  chapterId?: string;
  reviewStatus?: ReviewStatus | string; // Can be ReviewStatus enum or 'DRAFT' | 'REVIEWED' | 'APPROVED'
  difficultyLevel?: number;
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

// Review History Response
export interface ReviewHistoryResponse {
  exerciseId: string;
  reviewLogs: ExerciseReviewLog[];
}

export interface ExerciseReviewLog {
  id: string;
  reviewedBy: string;
  reviewStatus: ReviewStatus;
  reviewNotes?: string;
  createdAt: string;
}

// AI Generation Request/Response
export interface GenerateExercisesRequest {
  chapterCode: string; // Chapter code (String), not UUID
  skillCode: string; // Skill code (String), not UUID
  difficultyLevel: number; // 1-5, required
  exerciseCount?: number; // 1-10, optional, defaults to 1
}

export interface GenerateExercisesResponse {
  exercise: Exercise; // Single exercise (backend returns one at a time)
  providerUsed?: string; // gemini, huggingface, openai
  overallConfidence?: number; // 0.0-1.0
}

// Prompt Generation Request/Response
export interface GeneratePromptRequest {
  chapterCode: string; // Chapter code (String), not UUID
  skillCode: string; // Skill code (String), not UUID
  difficultyLevel: number; // 1-5, required
}

export interface GeneratePromptResponse {
  prompt: string;
}

// LaTeX Validation Types
export interface ValidateLaTeXRequest {
  problemText?: string;
  problemLatex?: string;
  solutionSteps?: SolutionStepRequest[];
  finalAnswer?: string;
  commonMistakes?: CommonMistakeRequest[];
  hints?: string[];
}

export interface LaTeXError {
  field: string;
  location: string;
  formula: string;
  error: string;
  suggestion?: string;
  autoFixable: boolean;
  fixedValue?: string;
}

export interface ValidateLaTeXResponse {
  isValid: boolean;
  errors: LaTeXError[];
  autoFixableCount: number;
  autoFixes: Record<string, string>;
}

// Exercise Created By enum (matches backend)
export enum ExerciseCreatedBy {
  ADMIN = 'ADMIN',
  AI = 'AI',
  TEACHER = 'TEACHER',
}

// Exercise Status enum (matches backend)
export enum ExerciseStatus {
  DRAFT = 'DRAFT',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
}
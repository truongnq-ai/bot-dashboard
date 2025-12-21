/**
 * Question Types
 */

import { ResponseObject, PageResponse } from './common';

// Enums
export enum QuestionType {
  PRACTICE = 'PRACTICE',
  MINI_TEST = 'MINI_TEST',
  REVIEW = 'REVIEW',
}

export enum QuestionStatus {
  DRAFT = 'DRAFT',
  ASSIGNED = 'ASSIGNED',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

// Solution Step (reuse from exercise)
export interface SolutionStep {
  stepNumber: number;
  description?: string;
  content: string;
  explanation?: string;
}

// Common Mistake (reuse from exercise)
export interface CommonMistake {
  mistake: string;
  explanation?: string;
}

// Question Entity
export interface Question {
  id: string;
  exerciseId: string;
  exerciseName?: string;
  skillId: string;
  skillCode?: string;
  skillName?: string;
  assignedToStudentId?: string;
  sessionId?: string;
  problemText: string;
  problemLatex?: string;
  problemImageUrl?: string;
  solutionSteps: SolutionStep[];
  finalAnswer?: string;
  commonMistakes?: CommonMistake[];
  hints?: string[];
  difficultyLevel?: number; // 1-5
  customizedData?: unknown;
  studentAnswer?: string;
  isCorrect?: boolean;
  timeTakenSec?: number;
  questionType?: QuestionType;
  status: QuestionStatus;
  assignedAt?: string;
  submittedAt?: string;
  practiceCount?: number;
  practices?: PracticeResponse[];
  createdAt: string;
}

// Practice Response (for Question detail)
export interface PracticeResponse {
  id: string;
  studentId?: string;
  trialId?: string;
  skillId: string;
  questionId?: string;
  isCorrect: boolean;
  durationSec?: number;
  createdAt: string;
}

// Search Params
export interface QuestionSearchParams {
  skillId?: string;
  exerciseId?: string;
  studentId?: string;
  status?: QuestionStatus;
  questionType?: QuestionType;
  searchText?: string;
  page?: number;
  pageSize?: number;
}

// Response DTOs
export interface QuestionListResponse extends PageResponse<Question> {}

export interface QuestionResponse extends ResponseObject<Question> {}

export interface QuestionListResponseData extends ResponseObject<QuestionListResponse> {}

export interface QuestionStatsResponse {
  questionId: string;
  exerciseId: string;
  skillId: string;
  totalPractices: number;
  completedCount: number;
  assignedCount: number;
  skippedCount: number;
  avgSuccessRate: number;
  avgTimeSec: number;
  byDifficulty?: Record<number, number>;
  byStatus?: Record<string, number>;
}

// Generate Question Request
export interface GenerateQuestionRequest {
  skillId?: string;
  studentId?: string;
  exerciseId?: string;
  difficultyLevel?: number; // 1-5
  count?: number; // 1-20
  questionType?: QuestionType;
  sessionId?: string;
}


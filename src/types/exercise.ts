/**
 * Exercise Types - Admin Dashboard
 */

import { ResponseObject, PageResponse } from './common';

// Enums
export enum ExerciseStatus {
    DRAFT = 'DRAFT',
    APPROVED = 'APPROVED',
}

export enum ExerciseType {
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',   // Trắc nghiệm
    SHORT_ANSWER = 'SHORT_ANSWER',         // Trả lời ngắn
    ESSAY = 'ESSAY',                       // Tự luận
    FILL_IN_BLANK = 'FILL_IN_BLANK',       // Điền khuyết
    MATCHING = 'MATCHING',                 // Nối / ghép
    TRUE_FALSE = 'TRUE_FALSE',             // Đúng / Sai
}

// Common Mistake structure
export interface CommonMistake {
    mistake: string;
    explanation?: string;
}

// Exercise Entity (full detail with content)
export interface Exercise {
    id: string;
    teacherId: string;
    subjectId: string;
    subjectName?: string; // Subject name for display
    topicId: string;
    topicName?: string; // Topic name for display
    content: string; // HTML content
    contentLatex?: string;
    difficulty?: number; // 1-5
    type?: ExerciseType; // Exercise type (optional)
    status: ExerciseStatus;
    createdBy: string; // Username of the creator
    solutionDraft?: string;
    learningObjective?: string;
    commonMistakes?: CommonMistake[];
    hints?: string[];
    timeEstimateSec?: number;
    createdAt: string;
    updatedAt: string;
}

// Exercise List Item (now includes content field)
export interface ExerciseListItem {
    id: string;
    teacherId: string;
    subjectId: string;
    topicId: string;
    contentLatex?: string;
    content: string;  // Added: content field (required)
    difficulty?: number; // 1-5
    type?: ExerciseType; // Exercise type (optional)
    status: ExerciseStatus;
    createdBy: string; // 'TEACHER' in Phase 1
    createdAt: string;
    updatedAt: string;
}

// Exercise List Item WITH content field (for selection modal preview)
export interface ExerciseListItemWithContent {
    id: string;
    teacherId: string;
    subjectId: string;
    topicId: string;
    contentLatex?: string;
    content: string; // Required - always present for preview
    difficulty?: number; // 1-5
    type?: ExerciseType; // Exercise type (optional)
    status: ExerciseStatus;
    createdBy: string; // 'TEACHER' in Phase 1
    createdAt: string;
    updatedAt: string;
}

// Request DTOs
export interface CreateExerciseRequest {
    subjectId: string; // UUID, required
    topicId: string; // UUID, required
    content: string; // HTML content, required
    contentLatex?: string; // Optional
    difficulty?: number; // 1-5, optional
    type?: ExerciseType; // Exercise type, optional
    solutionDraft?: string;
    learningObjective?: string;
    commonMistakes?: CommonMistake[];
    hints?: string[];
    timeEstimateSec?: number;
}

export interface UpdateExerciseRequest {
    subjectId?: string; // UUID, optional
    topicId?: string; // UUID, optional
    content?: string; // HTML content, optional
    contentLatex?: string; // Optional
    difficulty?: number; // 1-5, optional
    type?: ExerciseType; // Exercise type, optional
    solutionDraft?: string;
    learningObjective?: string;
    commonMistakes?: CommonMistake[];
    hints?: string[];
    timeEstimateSec?: number;
}

export interface ApproveExerciseRequest {
    // Currently empty, can be extended with optional notes in the future
}

export interface AIGenerateExerciseRequest {
    className?: string; // optional
    topicId: string; // UUID, required
    difficultyLevel: number; // 1-5, required
    exerciseCount?: number; // 1-10, optional, default 1
    type?: ExerciseType; // optional
}

export interface UploadFromFileRequest {
    fileUrl: string; // Cloudinary file URL, required
    subjectId: string; // UUID, required
}

export interface ParsedExercise {
    content: string; // Required
    solutionDraft?: string; // Optional
    hints?: string[]; // Optional
    commonMistakes?: CommonMistake[]; // Optional
}

export interface UploadFromFileResponse {
    isPerfect: boolean; // true if all exercises have content (parsing quality indicator)
    rawText?: string; // Raw text from OCR (if isPerfect=false, for manual editing)
    suggestedExercises?: ParsedExercise[]; // Parsed exercises (always provided for user review)
    createdExercises?: Exercise[]; // Always null - no auto-creation, user creates manually
}

export interface GeneratePromptRequest {
    topicId: string; // UUID, required
    difficultyLevel: number; // 1-5, required
    className?: string; // optional
    type?: ExerciseType; // optional
}

export interface GeneratePromptResponse {
    systemPrompt: string;
    userPrompt: string;
}

// Filter request for exercise pagination
export interface ExercisePageRequest {
    subjectId?: string;
    topicId?: string;
    status?: ExerciseStatus;
    difficulty?: number; // 1-5
    type?: ExerciseType; // Exercise type filter, optional
}

// Request for exercise statistics
export interface ExerciseStatsRequest {
    subjectId?: string;
    topicId?: string;
    difficulty?: number;
    type?: ExerciseType;
}

// Exercise statistics item
export interface ExerciseStats {
    subjectId: string;
    subjectName: string;
    topicId: string;
    topicName: string;
    difficulty: number;
    type: ExerciseType;
    exerciseCount: number;
}

// Request for batch fetching exercises
export interface GetExercisesBatchRequest {
    exerciseIds: string[];
}

// Response DTOs
export interface ExerciseResponse extends ResponseObject<Exercise> { }
export interface ExerciseListResponse extends PageResponse<ExerciseListItem> { }
export interface ExerciseListResponseData extends ResponseObject<ExerciseListResponse> { }
export interface ExerciseStatsResponse extends ResponseObject<ExerciseStats[]> { }

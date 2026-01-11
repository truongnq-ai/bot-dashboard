/**
 * Exercise Set Types - Admin Dashboard
 */

import { ResponseObject, PageResponse } from './common';

// Enums
export enum ExerciseSetIntent {
    PRACTICE = 'PRACTICE',
    REVIEW = 'REVIEW',
    SURVEY = 'SURVEY',
    TEST = 'TEST',
}

// Exercise Set Item (exercise within a set)
export interface ExerciseSetItem {
    id: string;
    exerciseId: string;
    orderIndex: number | null;
    // Exercise details for display
    exerciseContent: string;
    exerciseContentLatex?: string;
    exerciseSubjectId: string;
    exerciseSubjectName: string;
    exerciseTopicId: string;
    exerciseTopicName: string;
    exerciseDifficulty?: number; // 1-5
}

// Exercise Set Entity (full detail with exercises)
export interface ExerciseSet {
    id: string;
    teacherId: string;
    title: string;
    description?: string;
    intent: ExerciseSetIntent;
    noteForTeacher?: string;
    exercises: ExerciseSetItem[]; // Full list of exercises with order
    createdAt: string;
    updatedAt: string;
}

// Exercise Set List Item (without full exercise list to reduce payload)
export interface ExerciseSetListItem {
    id: string;
    teacherId: string;
    title: string;
    description?: string;
    intent: ExerciseSetIntent;
    noteForTeacher?: string;
    exerciseCount: number; // Number of exercises in the set
    subjectId?: string; // Subject ID from first exercise (for filtering)
    subjectName?: string; // Subject name for display
    createdAt: string;
    updatedAt: string;
}

// Request DTOs
export interface CreateExerciseSetRequest {
    title: string;
    description?: string;
    intent: ExerciseSetIntent;
    noteForTeacher?: string;
    exerciseIds: string[]; // List of exercise UUIDs
}

export interface UpdateExerciseSetRequest {
    title?: string;
    description?: string;
    intent?: ExerciseSetIntent;
    noteForTeacher?: string;
    exerciseIds?: string[]; // List of exercise UUIDs
}

export interface DuplicateExerciseSetRequest {
    newTitle?: string;
}

// Filter request for exercise set pagination
export interface ExerciseSetPageRequest {
    subjectId?: string;
    intent?: ExerciseSetIntent;
    title?: string;
}

// Response DTOs
export interface ExerciseSetResponse extends ResponseObject<ExerciseSet> { }
export interface ExerciseSetListResponse extends PageResponse<ExerciseSetListItem> { }
export interface ExerciseSetListResponseData extends ResponseObject<ExerciseSetListResponse> { }

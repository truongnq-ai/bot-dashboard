/**
 * Assignment, Result, and Comment Types - Admin Dashboard
 */

import { ResponseObject, PageResponse } from './common';
import { ExerciseSetIntent } from './exercise-set';

// Assignment types
export interface Assignment {
    id: string;
    classId: string;
    className: string;
    exerciseSetId: string;
    exerciseSetTitle: string;
    intent: ExerciseSetIntent;
    assignedAt: string;
    createdAt: string;
    updatedAt: string;
}

// Assignment list item (for paginated list)
export interface AssignmentListItem {
    id: string;
    exerciseSetId: string;
    exerciseSetTitle: string;
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    intent: ExerciseSetIntent;
    assignedAt: string;
}

// Filter request for assignment pagination
export interface AssignmentPageRequest {
    classId?: string;
    exerciseSetId?: string;
    subjectId?: string;
    exerciseSetTitle?: string;
    timeRange?: 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_3_MONTHS' | 'ALL';
}

export interface CreateAssignmentRequest {
    classId: string;
    exerciseSetId: string;
}

export interface CreateAssignmentsBatchRequest {
    exerciseSetId: string;
    classIds: string[];
}

export interface BatchAssignmentError {
    classId: string;
    errorMessage: string;
}

export interface BatchAssignmentResponse {
    success: Assignment[];
    errors: BatchAssignmentError[];
}

// Result types
export interface Result {
    id: string;
    assignmentId: string;
    studentId: string;
    studentName: string;
    exerciseId: string;
    value: string; // score or pass/fail
    createdAt: string;
    updatedAt: string;
}

export interface CreateResultRequest {
    assignmentId: string;
    studentId: string;
    exerciseId: string;
    value: string;
}

export interface UpdateResultRequest {
    value: string;
}

// Comment types
export enum CommentSource {
    MANUAL = 'MANUAL',
    AI_SUGGESTED_EDITED = 'AI_SUGGESTED_EDITED',
}

export interface Comment {
    id: string;
    assignmentId: string;
    studentId: string;
    studentName: string;
    exerciseId: string | null; // null for ExerciseSet-level comment
    content: string;
    source: CommentSource;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCommentRequest {
    assignmentId: string;
    studentId: string;
    exerciseId: string | null; // null for ExerciseSet-level
    content: string;
    source: CommentSource;
}

export interface UpdateCommentRequest {
    content: string;
}

export interface GenerateCommentDraftRequest {
    assignmentId: string;
    studentId: string;
    exerciseId: string | null;
    resultValue?: string;
    teacherNote?: string;
}

export interface CommentDraftResponse {
    draftText: string;
}

// Response DTOs
export interface AssignmentResponse extends ResponseObject<Assignment> { }
export interface AssignmentListResponse extends ResponseObject<Assignment[]> { }
export interface AssignmentListPageResponse extends ResponseObject<PageResponse<AssignmentListItem>> { }

export interface ResultResponse extends ResponseObject<Result> { }
export interface ResultListResponse extends ResponseObject<Result[]> { }

export interface CommentResponse extends ResponseObject<Comment> { }
export interface CommentListResponse extends ResponseObject<Comment[]> { }
export interface CommentDraftResponseData extends ResponseObject<CommentDraftResponse> { }

/**
 * Class Types (Admin Dashboard)
 */

import { ResponseObject } from './common';

// Class Entity
export interface Class {
    id: string;
    teacherId: string;
    teacherName: string;
    name: string;
    subjectId: string;
    subjectName: string;
    description?: string;
    note?: string;
    createdAt: string;
    updatedAt?: string;
}

// Search Params (for client-side filtering)
export interface ClassSearchParams {
    name?: string;
}

// Request DTOs
export interface CreateClassRequest {
    name: string;
    subjectId: string;
    description?: string;
    note?: string;
}

export interface UpdateClassRequest {
    name: string;
    subjectId: string;
    description?: string;
    note?: string;
}

// Response DTOs
export interface ClassListResponse extends ResponseObject<Class[]> { }

export interface ClassResponse extends ResponseObject<Class> { }

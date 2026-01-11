/**
 * Assignment Service - Admin Dashboard
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
    Assignment,
    AssignmentListItem,
    AssignmentListPageResponse,
    AssignmentPageRequest,
    CreateAssignmentRequest,
    CreateAssignmentsBatchRequest,
    BatchAssignmentResponse,
} from '@/types/assignment';
import { ResponseObject, PageRequest } from '@/types/common';

/**
 * Create assignment (assign ExerciseSet to Class)
 */
export async function createAssignment(
    data: CreateAssignmentRequest
): Promise<ResponseObject<Assignment>> {
    const response = await apiClient.post<ResponseObject<Assignment>>(
        API_ENDPOINTS.ASSIGNMENTS_CREATE,
        data
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to create assignment');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Get assignment by ID
 */
export async function getAssignmentById(id: string): Promise<ResponseObject<Assignment>> {
    const response = await apiClient.get<ResponseObject<Assignment>>(
        API_ENDPOINTS.ASSIGNMENTS_GET(id)
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to fetch assignment');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Get assignments by class ID
 */
export async function getAssignmentsByClassId(
    classId: string
): Promise<ResponseObject<Assignment[]>> {
    const response = await apiClient.get<ResponseObject<Assignment[]>>(
        API_ENDPOINTS.ASSIGNMENTS_BY_CLASS(classId)
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to fetch assignments');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Get assignments by exercise set ID
 */
export async function getAssignmentsByExerciseSetId(
    exerciseSetId: string
): Promise<ResponseObject<Assignment[]>> {
    const response = await apiClient.get<ResponseObject<Assignment[]>>(
        API_ENDPOINTS.ASSIGNMENTS_BY_EXERCISE_SET(exerciseSetId)
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to fetch assignments');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Create assignments in batch (assign ExerciseSet to multiple Classes)
 */
export async function createAssignmentsBatch(
    data: CreateAssignmentsBatchRequest
): Promise<ResponseObject<BatchAssignmentResponse>> {
    const response = await apiClient.post<ResponseObject<BatchAssignmentResponse>>(
        API_ENDPOINTS.ASSIGNMENTS_CREATE_BATCH,
        data
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to create assignments');
    }

    return {
        errorCode: response.data.errorCode,
        errorDetail: response.data.errorDetail,
        data: response.data.data,
    };
}

/**
 * Get paginated assignments with filters
 */
export async function getAssignments(
    pageRequest: PageRequest
): Promise<AssignmentListPageResponse> {
    const response = await apiClient.post<AssignmentListPageResponse>(
        API_ENDPOINTS.ASSIGNMENTS_GET_PAGE,
        pageRequest
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to fetch assignments');
    }

    return response.data;
}

/**
 * Delete assignment by ID
 */
export async function deleteAssignment(id: string): Promise<ResponseObject<void>> {
    const response = await apiClient.delete<ResponseObject<void>>(
        API_ENDPOINTS.ASSIGNMENTS_DELETE(id)
    );

    if (response.data.errorCode !== '0000') {
        throw new Error(response.data.errorDetail || 'Failed to delete assignment');
    }

    return response.data;
}
